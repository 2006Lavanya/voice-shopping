import { useState, useEffect, useCallback, useRef } from "react";
import { onImgError } from "../utils/image.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaCheck } from "react-icons/fa";
import api from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useVoice } from "../context/VoiceContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";

// Step indexes: 0 Cart Review, 1 Address, 2 Delivery, 3 Payment, 4 Confirmation (review before placing the order).
// Steps 0-3 are the original flow; step 4 is reached by voice ("place order") or by Continue from Payment via voice.
const STEP_COUNT = 5;
const DICT_FIELDS = ["fullName", "phone", "line1", "city", "state", "pincode"]; // asked one by one when adding an address by voice
const PAY_KEY = { COD: "ck.cod", UPI: "ck.upi", CARD: "ck.card", ONLINE: "ck.online" };

const emptyAddress = { fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", country: "India", isDefault: false };

const Checkout = () => {
  const { cart, subtotal, fetchCart } = useCart();
  const navigate = useNavigate();
  const { registerUiHandler } = useVoice();
  const { t } = useI18n();
  const items = cart?.items || [];
  const live = useRef({}); // always points at the latest handlers/state so the voice handler never goes stale
  const dictation = useRef(null); // { index, data } while an address is being dictated

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
  const [placing, setPlacing] = useState(false);
  const [loadingAddr, setLoadingAddr] = useState(true);

  const loadAddresses = useCallback(async () => {
    setLoadingAddr(true);
    try {
      const { data } = await api.get("/addresses");
      setAddresses(data.addresses);
      const def = data.addresses.find((a) => a.isDefault) || data.addresses[0];
      if (def) setSelectedAddress(def._id);
    } catch {
      // ignore
    } finally {
      setLoadingAddr(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // Voice: let the assistant drive this page (see VoiceContext.registerUiHandler)
  useEffect(
    () =>
      registerUiHandler({
        onAction: (a) => live.current.onAction?.(a),
        intercept: (text) => live.current.intercept?.(text),
      }),
    [registerUiHandler]
  );

  // A payment/delivery choice spoken on another page ("UPI payment") is applied when checkout opens
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("voiceshop_pending_checkout");
      if (!raw) return;
      sessionStorage.removeItem("voiceshop_pending_checkout");
      const a = JSON.parse(raw);
      if (a.action === "SET_PAYMENT" && PAY_KEY[a.value]) setPaymentMethod(a.value);
      if (a.action === "SET_DELIVERY" && ["standard", "express"].includes(a.value)) setDeliveryMethod(a.value);
    } catch {
      /* ignore */
    }
  }, []);

  if (items.length === 0 && step === 0) {
    live.current = { onAction: () => t("ck.say.cartEmpty"), intercept: () => undefined };
    return <EmptyState icon="🛒" title={t("ck.emptyTitle")} subtitle={t("ck.emptySub")} actionLabel={t("ck.browse")} actionTo="/products" />;
  }

  const tax = Math.round(subtotal * 0.05);
  const shippingFee = deliveryMethod === "express" ? 149 : subtotal > 999 ? 0 : 49;
  const discount = couponCode.toUpperCase() === "WELCOME10" ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + tax + shippingFee - discount;

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/addresses", newAddress);
      setAddresses((prev) => [data.address, ...prev]);
      setSelectedAddress(data.address._id);
      setAddingAddress(false);
      setNewAddress(emptyAddress);
      toast.success(t("ck.toast.addr"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("ck.toast.addrFail"));
    }
  };

  const handlePlaceOrder = async () => {
    const address = addresses.find((a) => a._id === selectedAddress);
    if (!address) {
      toast.error(t("ck.toast.selectAddr"));
      return;
    }
    setPlacing(true);
    try {
      const { data } = await api.post("/orders", {
        shippingAddress: address,
        paymentMethod,
        couponCode,
      });
      await fetchCart();
      toast.success(t("ck.toast.placed"));
      navigate(`/order-success/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || t("ck.toast.placeFail"));
    } finally {
      setPlacing(false);
    }
  };

  // ------------------------------------------------------------------ voice-driven checkout
  const units = items.reduce((n, i) => n + i.quantity, 0);
  const chosenAddress = addresses.find((a) => a._id === selectedAddress);
  const addrText = (a) => (a ? [a.fullName, a.line1, a.city].filter(Boolean).join(", ") : "");
  const payLabel = (v) => t(PAY_KEY[v] || "ck.cod");
  const deliveryLabel = (v) => t(v === "express" ? "ck.express" : "ck.standard");
  const reviewSpeech = () => t("ck.say.review", { n: units, total: formatCurrency(total), pay: payLabel(paymentMethod), addr: addrText(chosenAddress) });
  const needAddressSpeech = () => (addresses.length ? t("ck.say.needAddress") : t("ck.say.noAddress"));

  const speakFor = (n) => {
    if (n === 1) return addresses.length ? t("ck.say.address", { addr: addrText(chosenAddress || addresses[0]) }) : t("ck.say.noAddress");
    if (n === 2) return t("ck.say.delivery");
    if (n === 3) return t("ck.say.payment");
    return reviewSpeech();
  };

  const advance = () => {
    if (step === 0) { setStep(1); return speakFor(1); }
    if (step === 1) {
      if (!selectedAddress) return needAddressSpeech();
      setStep(2);
      return speakFor(2);
    }
    if (step === 2) { setStep(3); return speakFor(3); }
    if (step === 3) { setStep(4); return speakFor(4); }
    handlePlaceOrder();
    return t("ck.say.placing");
  };

  const onVoiceAction = (a) => {
    switch (a.action) {
      case "NEXT":
      case "CONFIRM":
        return advance();
      case "BACK":
        if (step === 0) { navigate("/cart"); return t("ck.say.back", { step: t("nav.cart") }); }
        setStep(step - 1);
        return t("ck.say.back", { step: t(`ck.step.${step - 1}`) });
      case "CONFIRM_ADDRESS":
        if (!selectedAddress) { setStep(1); return needAddressSpeech(); }
        setStep(2);
        return speakFor(2);
      case "SELECT_ADDRESS": {
        const ad = addresses[(a.ordinal || 1) - 1];
        if (!ad) return t("ck.say.noSuchAddress");
        setSelectedAddress(ad._id);
        if (a.confirm) { setStep(2); return speakFor(2); }
        setStep(1);
        return t("ck.say.selected", { addr: addrText(ad) });
      }
      case "NEW_ADDRESS":
        setStep(1);
        setAddingAddress(true);
        setNewAddress(emptyAddress);
        dictation.current = { index: 0, data: { ...emptyAddress } };
        return t("ck.say.dictStart", { q: t(`ck.say.q.${DICT_FIELDS[0]}`) });
      case "SET_DELIVERY":
        setDeliveryMethod(a.value);
        if (step === 2) { setStep(3); return t("ck.say.deliverySet", { label: deliveryLabel(a.value) }); }
        return t("ck.say.noted", { label: deliveryLabel(a.value) });
      case "SET_PAYMENT":
        setPaymentMethod(a.value);
        if (step === 3) { setStep(4); return t("ck.say.paymentSet", { label: payLabel(a.value), total: formatCurrency(total) }); }
        return t("ck.say.noted", { label: payLabel(a.value) });
      case "PLACE_ORDER":
        if (!selectedAddress) { setStep(1); return needAddressSpeech(); }
        if (step === 4) { handlePlaceOrder(); return t("ck.say.placing"); }
        setStep(4);
        return reviewSpeech();
      case "CONFIRM_ORDER":
        if (!selectedAddress) { setStep(1); return needAddressSpeech(); }
        if (step < 3) return advance(); // never skip delivery/payment: move to the next step instead
        handlePlaceOrder();
        return t("ck.say.placing");
      case "COUPON": {
        setCouponCode(a.code);
        const saved = a.code === "WELCOME10" ? Math.round(subtotal * 0.1) : 0;
        return saved ? t("ck.say.couponApplied", { code: a.code, amount: formatCurrency(saved) }) : t("ck.say.coupon", { code: a.code });
      }
      default:
        return undefined;
    }
  };

  // While an address is being dictated, every sentence is the answer to the current question
  const onVoiceIntercept = async (text) => {
    const d = dictation.current;
    if (!d) return undefined;
    const raw = text.trim();
    if (/^(cancel|stop|never ?mind|vendaam|venam|வேண்டாம்|நிறுத்து)/i.test(raw)) {
      dictation.current = null;
      setAddingAddress(false);
      return t("ck.say.dictCancel");
    }
    const field = DICT_FIELDS[d.index];
    let value = raw;
    if (field === "phone") {
      value = raw.replace(/\D/g, "");
      if (value.length !== 10) return t("ck.say.badPhone");
    }
    if (field === "pincode") {
      value = raw.replace(/\D/g, "");
      if (value.length !== 6) return t("ck.say.badPin");
    }
    const data = { ...d.data, [field]: value };
    setNewAddress(data); // the form fills in live as the shopper speaks
    if (d.index + 1 < DICT_FIELDS.length) {
      dictation.current = { index: d.index + 1, data };
      return t(`ck.say.q.${DICT_FIELDS[d.index + 1]}`);
    }
    dictation.current = null;
    try {
      const { data: res } = await api.post("/addresses", data);
      setAddresses((prev) => [res.address, ...prev]);
      setSelectedAddress(res.address._id);
      setAddingAddress(false);
      setNewAddress(emptyAddress);
      return t("ck.say.dictDone");
    } catch {
      return t("ck.say.dictFail");
    }
  };
  live.current = { onAction: onVoiceAction, intercept: onVoiceIntercept };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{t("ck.title")}</h1>
      <p className="text-xs text-zinc-400 mb-6">{t("ck.voiceHint")}</p>

      {/* Stepper */}
      <div className="flex items-center mb-10 overflow-x-auto">
        {Array.from({ length: STEP_COUNT }, (_, i) => t(`ck.step.${i}`)).map((s, i) => (
          <div key={i} className="flex items-center shrink-0" aria-current={i === step ? "step" : undefined}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? "bg-brand-pink text-white" : "bg-zinc-200 text-zinc-500"}`}>
              {i < step ? <FaCheck size={10} /> : i + 1}
            </div>
            <span className={`ml-2 text-sm ${i === step ? "font-semibold" : "text-zinc-400"}`}>{s}</span>
            {i < STEP_COUNT - 1 && <div className="w-10 h-0.5 bg-zinc-200 mx-3" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="font-semibold">{t("ck.review")}</h2>
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <img onError={onImgError} src={item.product.images?.[0]} className="w-16 h-16 rounded-lg object-cover" alt="" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product.name}</p>
                    <p className="text-xs text-zinc-400">{t("ck.qty", { n: item.quantity })}</p>
                  </div>
                  <p className="font-semibold text-sm">{formatCurrency((item.product.discountPrice || item.product.price) * item.quantity)}</p>
                </div>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-card">
              <h2 className="font-semibold mb-4">{t("ck.chooseAddr")}</h2>
              {loadingAddr ? (
                <Loader />
              ) : (
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <label key={a._id} className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer ${selectedAddress === a._id ? "border-brand-pink bg-brand-light/40 dark:bg-zinc-800" : "border-zinc-200 dark:border-zinc-700"}`}>
                      <input type="radio" checked={selectedAddress === a._id} onChange={() => setSelectedAddress(a._id)} className="mt-1" />
                      <div className="text-sm">
                        <p className="font-medium">{a.fullName} · {a.phone}</p>
                        <p className="text-zinc-500">{a.line1}, {a.line2 && `${a.line2}, `}{a.city}, {a.state} - {a.pincode}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {!addingAddress ? (
                <button onClick={() => setAddingAddress(true)} className="mt-4 text-brand-pink text-sm font-medium">{t("ck.addNew")}</button>
              ) : (
                <form onSubmit={handleAddAddress} className="mt-4 grid grid-cols-2 gap-3">
                  {["fullName", "phone", "line1", "line2", "city", "state", "pincode"].map((key) => (
                    <input
                      key={key} required={key !== "line2"} placeholder={t(`ck.f.${key}`)} aria-label={t(`ck.f.${key}`)} value={newAddress[key]}
                      onChange={(e) => setNewAddress((f) => ({ ...f, [key]: e.target.value }))}
                      className="col-span-1 px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                    />
                  ))}
                  <div className="col-span-2 flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-brand-pink text-white rounded-full text-sm">{t("ck.saveAddr")}</button>
                    <button type="button" onClick={() => setAddingAddress(false)} className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-full text-sm">{t("ck.cancel")}</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-card space-y-3">
              <h2 className="font-semibold mb-2">{t("ck.deliveryMethod")}</h2>
              {[
                { value: "standard", label: t("ck.standard"), price: subtotal > 999 ? t("ck.free") : formatCurrency(49) },
                { value: "express", label: t("ck.express"), price: formatCurrency(149) },
              ].map((opt) => (
                <label key={opt.value} className={`flex items-center justify-between border rounded-xl p-4 cursor-pointer ${deliveryMethod === opt.value ? "border-brand-pink bg-brand-light/40 dark:bg-zinc-800" : "border-zinc-200 dark:border-zinc-700"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={deliveryMethod === opt.value} onChange={() => setDeliveryMethod(opt.value)} />
                    <span className="text-sm">{opt.label}</span>
                  </div>
                  <span className="text-sm font-medium">{opt.price}</span>
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-card space-y-3">
              <h2 className="font-semibold mb-2">{t("ck.paymentMethod")}</h2>
              {[
                { value: "COD", label: t("ck.cod") },
                { value: "UPI", label: t("ck.upi") },
                { value: "CARD", label: t("ck.card") },
                { value: "ONLINE", label: t("ck.online") },
              ].map((opt) => (
                <label key={opt.value} className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer ${paymentMethod === opt.value ? "border-brand-pink bg-brand-light/40 dark:bg-zinc-800" : "border-zinc-200 dark:border-zinc-700"}`}>
                  <input type="radio" checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
              {paymentMethod !== "COD" && (
                <p className="text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
                  {t("ck.sandbox")}
                </p>
              )}
              <div className="pt-2">
                <label className="text-sm font-medium">{t("ck.coupon")}</label>
                <div className="flex gap-2 mt-1">
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder={t("ck.couponPh")} className="flex-1 px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-card space-y-3 animate-fadeUp" role="region" aria-label={t("ck.confirmTitle")}>
              <h2 className="font-semibold">{t("ck.confirmTitle")}</h2>
              <dl className="text-sm space-y-2">
                <div className="flex justify-between gap-4"><dt className="text-zinc-500">{t("ck.items", { n: units })}</dt><dd className="font-medium">{formatCurrency(subtotal)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-zinc-500">{t("ck.shipTo")}</dt><dd className="font-medium text-right">{addrText(chosenAddress)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-zinc-500">{t("ck.deliveryMethod")}</dt><dd className="font-medium">{deliveryLabel(deliveryMethod)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-zinc-500">{t("ck.payWith")}</dt><dd className="font-medium">{payLabel(paymentMethod)}</dd></div>
                <div className="flex justify-between gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-2 text-base font-bold"><dt>{t("ck.total")}</dt><dd>{formatCurrency(total)}</dd></div>
              </dl>
              <p className="text-xs text-zinc-400">{t("ck.confirmHint")}</p>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
              className="px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm disabled:opacity-30"
            >
              {t("ck.back")}
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 && !selectedAddress}
                className="px-6 py-2.5 rounded-full bg-brand-pink text-white text-sm font-medium disabled:opacity-40"
              >
                {t("ck.continue")}
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="px-6 py-2.5 rounded-full bg-brand-pink text-white text-sm font-medium disabled:opacity-60"
              >
                {placing ? t("ck.placing") : t("ck.place")}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-card h-fit">
          <h2 className="font-semibold mb-4">{t("ck.summary")}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-zinc-500">{t("ck.subtotal")}</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">{t("ck.tax")}</span><span>{formatCurrency(tax)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">{t("ck.delivery")}</span><span>{shippingFee === 0 ? t("ck.free") : formatCurrency(shippingFee)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>{t("ck.discount")}</span><span>-{formatCurrency(discount)}</span></div>}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 flex justify-between font-bold text-base">
              <span>{t("ck.total")}</span><span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
