import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown, BedDouble, Bath, Maximize2, Check, Printer, Wallet, CalendarClock, FileSignature, TrendingDown, Download } from "lucide-react";
import { FLOOR_DATA as STATIC_FLOOR_DATA, SCHEMES, PLAN_IMG } from "../data/units";
import { loadInventory } from "../data/loadInventory";

const C = {
  petroleo: "#0E2B3D", petroleo2: "#143b50", carbon: "#162028",
  crema: "#F4E9D7", cremaCard: "#FBF6EC", verde: "#1E6D3D", verdeLight: "#2E8B52",
  verdeGlow: "#43c47a", rojo: "#C0492F", oliva: "#46463E", taupe: "#A49A8E",
  borde: "#E2D7C2", white: "#FFFFFF",
};

const fmt = (v) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(Math.round(v));

export default function SimuladorRobledo81() {
  const [floorKey, setFloorKey] = useState("");
  const [nom, setNom] = useState("");
  const [schemeId, setSchemeId] = useState(null);
  const [meses, setMeses] = useState(12);
  const [cliente, setCliente] = useState("");
  const [asesor, setAsesor] = useState("");
  const [showCot, setShowCot] = useState(false);
  const [inventory, setInventory] = useState(null); // null = cargando

  useEffect(() => {
    loadInventory()
      .then((data) => setInventory(data))
      .catch(() => setInventory(STATIC_FLOOR_DATA));
  }, []);

  const FLOOR_DATA = inventory ?? STATIC_FLOOR_DATA;
  const FLOOR_KEYS = Object.keys(FLOOR_DATA);

  const fd = floorKey ? FLOOR_DATA[floorKey] : null;
  const unit = fd ? fd.units.find((x) => x.nom === nom) || null : null;
  const scheme = SCHEMES.find((s) => s.id === schemeId) || null;
  const calc = useMemo(() => {
    if (!unit || !scheme) return null;
    const p = unit[scheme.priceKey];
    return { precio: p, eng: p * scheme.eng / 100, msi: p * scheme.msi / 100, esc: p * scheme.esc / 100, mensual: p * scheme.msi / 100 / meses, ahorro: unit.n - p };
  }, [unit, scheme, meses]);

  const onFloor = (e) => { setFloorKey(e.target.value); setNom(""); setSchemeId(null); };
  const onUnit = (e) => { setNom(e.target.value); setSchemeId(null); };

  const today = new Date();
  const fecha = today.toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
  const folio = `R81-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}${unit ? "-" + unit.nom : ""}`;
  const descargarPDF = () => {
    const prev = document.title;
    document.title = `Cotizacion_R81_${unit ? unit.nom : ""}${cliente ? "_" + cliente.trim().replace(/\s+/g, "-") : ""}`;
    window.print();
    setTimeout(() => { document.title = prev; }, 600);
  };

  return (
    <div style={{ fontFamily: "'Poppins','Segoe UI',system-ui,sans-serif", background: C.crema, minHeight: 600, color: C.oliva }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fade{animation:fadeUp .35s ease both}
        @page{size:letter;margin:12mm}
        @media print{
          body *{visibility:hidden !important}
          #cot-overlay{position:static !important;background:none !important;overflow:visible !important;padding:0 !important;display:block !important;inset:unset !important}
          #cot-wrap{position:static !important;width:auto !important;max-width:none !important;display:block !important}
          #cot-print,#cot-print *{visibility:visible !important;print-color-adjust:exact !important;-webkit-print-color-adjust:exact !important}
          #cot-print{position:fixed !important;left:0 !important;right:0 !important;top:0 !important;width:auto !important;box-sizing:border-box !important;box-shadow:none !important;border-radius:0 !important;padding:24px 32px !important}
        }
      `}</style>

      <div style={{ background: `linear-gradient(120deg, ${C.petroleo}, ${C.petroleo2})`, padding: "16px 24px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: C.white, fontWeight: 700, letterSpacing: ".04em", fontSize: 19 }}>ROBLEDO</span>
        <span style={{ border: `2px solid ${C.white}`, borderRadius: 6, color: C.white, fontWeight: 700, fontSize: 15, padding: "0 6px" }}>81</span>
        <span style={{ marginLeft: 12, color: C.taupe, fontSize: 12, letterSpacing: ".12em" }}>SIMULADOR · ASESORES</span>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "26px 20px 60px" }}>
        <div style={{ background: C.cremaCard, border: `1px solid ${C.borde}`, borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 600, color: C.verde, marginBottom: 14 }}>
            {inventory === null ? "Cargando inventario…" : "Cotiza un departamento"}
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Field label="Nivel / Piso" flex="1 1 240px">
              <Select value={floorKey} onChange={onFloor}>
                <option value="">Selecciona un nivel…</option>
                {FLOOR_KEYS.map((fk) => (
                  <option key={fk} value={fk}>Piso {FLOOR_DATA[fk].piso} · {fk}</option>
                ))}
              </Select>
            </Field>
            <Field label="Departamento" flex="1 1 240px">
              <Select value={nom} onChange={onUnit} disabled={!fd}>
                <option value="">{fd ? "Selecciona un depa…" : "Primero elige el nivel"}</option>
                {fd && fd.units.map((x) => (
                  <option key={x.nom} value={x.nom} disabled={x.vendido}>
                    {x.nom} · {x.modelo} · {x.m2} m²{x.vendido ? " — Vendido" : ""}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>

        {unit && (
          <div className="fade" key={unit.nom}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 18 }}>
              <div style={{ flex: "1 1 240px", minWidth: 0, background: C.white, border: `1px solid ${C.borde}`, borderRadius: 16, padding: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={PLAN_IMG[fd.img]} alt={`Planta ${floorKey}`} style={{ maxWidth: "100%", maxHeight: 260, width: "auto", height: "auto", objectFit: "contain", display: "block", margin: "0 auto", borderRadius: 8 }} />
              </div>
              <div style={{ flex: "1 1 300px", background: `linear-gradient(135deg, ${C.petroleo}, ${C.petroleo2})`, borderRadius: 16, padding: "22px 24px", color: C.white, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontSize: 11, letterSpacing: ".18em", color: C.verdeGlow, fontWeight: 600 }}>MODELO {unit.modelo.toUpperCase()}</div>
                <div style={{ fontSize: 30, fontWeight: 700, marginTop: 2 }}>Departamento {unit.nom}</div>
                <div style={{ display: "flex", gap: 22, marginTop: 16 }}>
                  <Spec icon={<Maximize2 size={16} />} label="Superficie" v={`${unit.m2} m²`} />
                  <Spec icon={<BedDouble size={16} />} label="Recámaras" v={unit.rec} />
                  <Spec icon={<Bath size={16} />} label="Baños" v={unit.ban} />
                </div>
                <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.15)" }}>
                  <div style={{ fontSize: 11, color: C.taupe, letterSpacing: ".1em" }}>PRECIO DE LISTA</div>
                  <div style={{ fontSize: 28, fontWeight: 700, marginTop: 2 }}>{fmt(unit.n)}</div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 600, color: C.verde, margin: "24px 0 12px" }}>Elige el plan de pago</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
              {SCHEMES.map((s) => {
                const sel = s.id === schemeId;
                return (
                  <button key={s.id} onClick={() => setSchemeId(s.id)}
                    style={{ textAlign: "left", borderRadius: 14, border: `1.5px solid ${sel ? C.verde : C.borde}`, background: sel ? `linear-gradient(160deg,${C.verde},${C.verdeLight})` : C.cremaCard, color: sel ? C.white : C.carbon, padding: "15px 17px", cursor: "pointer", transition: "all .15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14.5, fontWeight: 600 }}>{s.label}</span>
                      {sel && <Check size={16} />}
                    </div>
                    <div style={{ fontSize: 21, fontWeight: 700, margin: "7px 0 6px" }}>{fmt(unit[s.priceKey])}</div>
                    <div style={{ fontSize: 11, opacity: .85 }}>{s.eng}% Eng · {s.msi}% Diferido · {s.esc}% Escritura</div>
                  </button>
                );
              })}
            </div>

            {calc && scheme && (
              <div className="fade" key={scheme.id} style={{ marginTop: 18, background: C.cremaCard, border: `1px solid ${C.borde}`, borderRadius: 16, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.carbon }}>Desglose — {scheme.label}</h3>
                  {calc.ahorro > 0 && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: C.verde, fontWeight: 600, background: "rgba(30,109,61,.1)", padding: "4px 10px", borderRadius: 18 }}>
                      <TrendingDown size={14} /> Ahorro vs lista: {fmt(calc.ahorro)}
                    </span>
                  )}
                </div>

                <Row icon={<Wallet size={16} />} c={C.verde} l={`Enganche · ${scheme.eng}%`} hint="Pago inicial" v={fmt(calc.eng)} />
                <Row icon={<CalendarClock size={16} />} c={C.verdeLight} l={`Diferido · ${scheme.msi}%`} hint="A diferir en mensualidades" v={fmt(calc.msi)} />
                <Row icon={<FileSignature size={16} />} c={C.petroleo} l={`Escritura · ${scheme.esc}%`} hint="Pago al escriturar" v={fmt(calc.esc)} />

                <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: `1px solid ${C.borde}`, marginTop: 16 }}>
                  {[{ t: "Enganche", p: scheme.eng, c: C.verde }, { t: "Diferido", p: scheme.msi, c: C.verdeLight }, { t: "Escritura", p: scheme.esc, c: C.petroleo }].map((seg, i) => (
                    <div key={i} style={{ width: `${seg.p}%`, background: seg.c, color: "#fff", padding: "9px 6px", textAlign: "center", minWidth: 0 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{seg.t}</div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{seg.p}%</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, background: `linear-gradient(120deg,${C.petroleo},${C.petroleo2})`, borderRadius: 12, padding: "15px 18px", color: C.white, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, color: C.taupe }}>Diferido a</span>
                    <select value={meses} onChange={(e) => setMeses(Number(e.target.value))}
                      style={{ background: "rgba(255,255,255,.12)", color: C.white, border: "1px solid rgba(255,255,255,.25)", borderRadius: 8, padding: "5px 8px", fontSize: 13, fontWeight: 600 }}>
                      {Array.from({ length: 10 }, (_, i) => 12 + i).map((mm) => <option key={mm} value={mm} style={{ color: C.carbon }}>{mm} meses</option>)}
                    </select>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: C.taupe, letterSpacing: ".1em" }}>MENSUALIDAD ESTIMADA</div>
                    <div style={{ fontSize: 23, fontWeight: 700, color: C.verdeGlow }}>{fmt(calc.mensual)}</div>
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${C.borde}`, marginTop: 16, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: C.taupe }}>Total {scheme.label}</div>
                    <span style={{ fontSize: 23, fontWeight: 700, color: C.carbon }}>{fmt(calc.precio)}</span>
                  </div>
                  <button onClick={() => setShowCot(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.verde, color: C.white, border: "none", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                    <Printer size={16} /> Generar cotización
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!unit && (
          <div style={{ marginTop: 18, textAlign: "center", color: C.taupe, fontSize: 14, padding: "40px 20px" }}>
            Elige un nivel y un departamento para ver el precio de lista y los planes de pago.
          </div>
        )}
      </div>

      {showCot && unit && scheme && calc && (
        <div id="cot-overlay" onClick={() => setShowCot(false)} style={{ position: "fixed", inset: 0, background: "rgba(14,43,61,.55)", zIndex: 50, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "26px 12px" }}>
          <div id="cot-wrap" onClick={(e) => e.stopPropagation()} style={{ width: 640, maxWidth: "100%" }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <input placeholder="Nombre del cliente" value={cliente} onChange={(e) => setCliente(e.target.value)}
                style={{ flex: "1 1 220px", border: `1.5px solid ${C.borde}`, borderRadius: 10, padding: "11px 13px", fontSize: 14, fontFamily: "inherit", color: C.carbon }} />
              <input placeholder="Nombre del asesor" value={asesor} onChange={(e) => setAsesor(e.target.value)}
                style={{ flex: "1 1 220px", border: `1.5px solid ${C.borde}`, borderRadius: 10, padding: "11px 13px", fontSize: 14, fontFamily: "inherit", color: C.carbon }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <button onClick={descargarPDF} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.verde, color: C.white, border: "none", borderRadius: 11, padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                <Download size={16} /> Descargar PDF
              </button>
              <button onClick={() => setShowCot(false)} style={{ background: C.cremaCard, color: C.carbon, border: `1.5px solid ${C.borde}`, borderRadius: 11, padding: "12px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Cerrar
              </button>
            </div>

            <div id="cot-print" style={{ background: "#fff", borderRadius: 12, padding: "36px 40px", color: C.carbon, boxShadow: "0 20px 50px rgba(0,0,0,.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `2px solid ${C.petroleo}`, paddingBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: C.petroleo, fontWeight: 700, letterSpacing: ".04em", fontSize: 22 }}>ROBLEDO</span>
                  <span style={{ border: `2px solid ${C.petroleo}`, borderRadius: 6, color: C.petroleo, fontWeight: 700, fontSize: 17, padding: "1px 7px" }}>81</span>
                </div>
                <div style={{ textAlign: "right", fontSize: 12, color: C.oliva }}>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".14em", color: C.petroleo }}>COTIZACIÓN</div>
                  <div style={{ marginTop: 4 }}>Folio: {folio}</div>
                  <div>{fecha}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 30, marginTop: 18 }}>
                <div><div style={{ fontSize: 10.5, letterSpacing: ".1em", color: C.taupe }}>CLIENTE</div><div style={{ fontSize: 15, fontWeight: 600 }}>{cliente || "—"}</div></div>
                <div><div style={{ fontSize: 10.5, letterSpacing: ".1em", color: C.taupe }}>ASESOR</div><div style={{ fontSize: 15, fontWeight: 600 }}>{asesor || "—"}</div></div>
              </div>

              <div style={{ marginTop: 20, background: C.crema, borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ fontSize: 11, letterSpacing: ".14em", color: C.verde, fontWeight: 600 }}>MODELO {unit.modelo.toUpperCase()}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: C.petroleo }}>Departamento {unit.nom}</div>
                <div style={{ display: "flex", gap: 26, marginTop: 12, fontSize: 13, flexWrap: "wrap" }}>
                  <span><b>{unit.m2} m²</b> superficie</span>
                  <span><b>{unit.rec}</b> {unit.rec > 1 ? "recámaras" : "recámara"}</span>
                  <span><b>{unit.ban}</b> {unit.ban > 1 ? "baños" : "baño"}</span>
                  <span>Piso <b>{fd.piso}</b></span>
                </div>
              </div>

              <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
                <span style={{ fontSize: 13, color: C.oliva }}>Precio de lista</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: C.oliva }}>{fmt(unit.n)}</span>
              </div>

              <div style={{ marginTop: 14, border: `1px solid ${C.borde}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ background: C.petroleo, color: "#fff", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600 }}>Plan: {scheme.label}</span>
                  <span style={{ fontWeight: 700, fontSize: 18 }}>{fmt(calc.precio)}</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                  <tbody>
                    <CotRow l={`Enganche (${scheme.eng}%)`} sub="Pago inicial" v={fmt(calc.eng)} />
                    <CotRow l={`Diferido (${scheme.msi}%)`} sub={`${meses} mensualidades de ${fmt(calc.mensual)}`} v={fmt(calc.msi)} />
                    <CotRow l={`Escritura (${scheme.esc}%)`} sub="Pago al escriturar" v={fmt(calc.esc)} />
                  </tbody>
                </table>
                <div style={{ background: C.crema, padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.borde}` }}>
                  <span style={{ fontWeight: 700, color: C.petroleo }}>Total</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: C.petroleo }}>{fmt(calc.precio)}</span>
                </div>
              </div>

              <div style={{ marginTop: 20, fontSize: 10.5, color: C.taupe, lineHeight: 1.6, borderTop: `1px solid ${C.borde}`, paddingTop: 14 }}>
                Cotización informativa, sin valor de contrato. Precios en pesos mexicanos (MXN) sujetos a cambio sin previo aviso y condicionados a disponibilidad al momento de la firma. Las mensualidades del esquema diferido son estimadas. Robledo81 · Guadalajara, Jalisco.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, flex, children }) {
  return (
    <div style={{ flex }}>
      <label style={{ display: "block", fontSize: 12, color: C.oliva, fontWeight: 600, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
function Select({ children, ...props }) {
  return (
    <div style={{ position: "relative" }}>
      <select {...props}
        style={{ width: "100%", appearance: "none", WebkitAppearance: "none", background: props.disabled ? "#efe7d6" : C.white, color: props.disabled ? C.taupe : C.carbon, border: `1.5px solid ${C.borde}`, borderRadius: 11, padding: "12px 38px 12px 14px", fontSize: 14.5, fontWeight: 500, cursor: props.disabled ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
        {children}
      </select>
      <ChevronDown size={18} color={C.taupe} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
    </div>
  );
}
function Spec({ icon, label, v }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, color: C.taupe, fontSize: 11, letterSpacing: ".04em" }}><span style={{ color: C.verdeGlow }}>{icon}</span>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginTop: 3 }}>{v}</div>
    </div>
  );
}
function CotRow({ l, sub, v }) {
  return (
    <tr style={{ borderBottom: "1px solid #eee" }}>
      <td style={{ padding: "11px 18px" }}>
        <div style={{ fontWeight: 600 }}>{l}</div>
        <div style={{ fontSize: 11.5, color: "#A49A8E" }}>{sub}</div>
      </td>
      <td style={{ padding: "11px 18px", textAlign: "right", fontWeight: 700 }}>{v}</td>
    </tr>
  );
}
function Row({ icon, c, l, hint, v }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(226,215,194,.6)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, background: c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.carbon }}>{l}</div>
          <div style={{ fontSize: 11.5, color: C.taupe }}>{hint}</div>
        </div>
      </div>
      <span style={{ fontSize: 16, fontWeight: 700, color: C.oliva }}>{v}</span>
    </div>
  );
}
