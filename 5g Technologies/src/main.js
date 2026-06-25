const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// Icon helpers
const { FaRobot, FaWifi, FaNetworkWired, FaIndustry, FaShieldAlt, FaTruck, FaPlane, FaHardHat } = require("react-icons/fa");
const { MdSignalCellular4Bar, MdSpeed, MdWarning, MdCheckCircle } = require("react-icons/md");
const { BiSignal5 } = require("react-icons/bi");

function renderIconSvg(IconComponent, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}
async function iconToBase64(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// Color palette — "Ocean Gradient" meets dark tech
const C = {
  dark:     "0A1628",   // slide background (deep navy)
  navy:     "0D2137",   // card background
  teal:     "00B4D8",   // primary accent
  cyan:     "48CAE4",   // secondary accent
  green:    "06D6A0",   // "solution" highlight
  orange:   "FF6B35",   // "problem" highlight
  white:    "FFFFFF",
  gray:     "94A3B8",
  lightBg:  "0F1E35",   // slightly lighter than dark for content slides
};

const makeShadow = () => ({ type: "outer", color: "000000", blur: 10, offset: 3, angle: 135, opacity: 0.35 });

let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "5G Plus - Vienna Robotics Use Cases";

// ─────────────────────────────────────────────────────────────
// SLIDE 1: TITLE
// ─────────────────────────────────────────────────────────────
async function addTitleSlide() {
  const slide = pres.addSlide();
  slide.background = { color: C.dark };

  // Big teal circle decoration top-right
  slide.addShape(pres.shapes.OVAL, { x: 7.5, y: -1.2, w: 4.5, h: 4.5, fill: { color: C.teal, transparency: 85 }, line: { color: C.teal, width: 1, transparency: 60 } });
  slide.addShape(pres.shapes.OVAL, { x: 8.2, y: -0.5, w: 2.8, h: 2.8, fill: { color: C.cyan, transparency: 80 }, line: { color: C.cyan, width: 1, transparency: 50 } });

  // Small circle bottom-left
  slide.addShape(pres.shapes.OVAL, { x: -0.8, y: 3.8, w: 3.0, h: 3.0, fill: { color: C.teal, transparency: 90 }, line: { color: C.teal, width: 1, transparency: 70 } });

  // Tagline top
  slide.addText("THE FUTURE CANNOT BE UNCONNECTED", {
    x: 0.7, y: 0.55, w: 8.6, h: 0.35,
    fontSize: 10, fontFace: "Calibri", color: C.cyan, bold: true, charSpacing: 5, align: "left", margin: 0
  });

  // Main title
  slide.addText("5G Plus Technology", {
    x: 0.7, y: 1.0, w: 9.0, h: 0.85,
    fontSize: 44, fontFace: "Cambria", color: C.white, bold: true, align: "left", margin: 0
  });
  slide.addText("Robotics Use Cases\nin the Vienna Ecosystem", {
    x: 0.7, y: 1.85, w: 9.0, h: 1.0,
    fontSize: 24, fontFace: "Calibri", color: C.cyan, bold: false, align: "left", margin: 0
  });

  // Divider
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 3.05, w: 4.0, h: 0.03, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });

  // Sub-info
  slide.addText("8 Detailed Use Cases  |  Vienna-Based Enterprises  |  5G SA Solutions", {
    x: 0.7, y: 3.2, w: 8.6, h: 0.35,
    fontSize: 12, fontFace: "Calibri", color: C.gray, align: "left", margin: 0
  });

  // Company pills at bottom
  const companies = ["ÖBB", "Wiener Linien", "Österr. Post AG", "Flughafen Wien", "STRABAG SE", "A1 Telekom", "TU Wien", "Blue Danube Robotics"];
  let pillX = 0.7;
  for (const c of companies) {
    const w = c.length * 0.088 + 0.3;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: pillX, y: 4.8, w, h: 0.32, fill: { color: C.navy }, rectRadius: 0.05, line: { color: C.teal, width: 1 } });
    slide.addText(c, { x: pillX, y: 4.8, w, h: 0.32, fontSize: 8.5, fontFace: "Calibri", color: C.cyan, align: "center", margin: 0 });
    pillX += w + 0.12;
  }
}

// ─────────────────────────────────────────────────────────────
// SLIDE 2: OVERVIEW TABLE
// ─────────────────────────────────────────────────────────────
async function addOverviewSlide() {
  const slide = pres.addSlide();
  slide.background = { color: C.dark };

  slide.addText("SCOPE", { x: 0.5, y: 0.25, w: 9, h: 0.3, fontSize: 9, fontFace: "Calibri", color: C.cyan, bold: true, charSpacing: 4, margin: 0 });
  slide.addText("8 Use Cases — At a Glance", { x: 0.5, y: 0.55, w: 9, h: 0.5, fontSize: 26, fontFace: "Cambria", color: C.white, bold: true, margin: 0 });

  const cases = [
    { num: "01", firm: "Logistics AMR Fleet Management", key: "Seamless Handover", icon: "🏭" },
    { num: "02", firm: "Edge-SLAM & Computation Offloading", key: "Computation Offloading", icon: "🧠" },
    { num: "03", firm: "Network Slicing — Mission-Critical Isolation", key: "Network Slicing", icon: "🔀" },
    { num: "04", firm: "ÖBB — Railway Infrastructure Inspection", key: "BVLOS Patrol", icon: "🚂" },
    { num: "05", firm: "Wiener Linien — Subway Tunnel Inspection", key: "Leaky Feeder 5G", icon: "🚇" },
    { num: "06", firm: "Österr. Post — Autonomous Delivery Bots", key: "Network Slicing", icon: "📦" },
    { num: "07", firm: "Flughafen Wien — Apron UGV Fleet Control", key: "Private 5G SA + Positioning", icon: "✈️" },
    { num: "08", firm: "STRABAG/PORR — Construction Site LiDAR", key: "Nomadic Node + eMBB", icon: "🏗️" },
  ];

  const cols = [cases.slice(0, 4), cases.slice(4, 8)];
  cols.forEach((col, ci) => {
    col.forEach((c, ri) => {
      const x = 0.35 + ci * 4.75;
      const y = 1.3 + ri * 0.98;
      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 4.55, h: 0.85, fill: { color: C.navy }, rectRadius: 0.08, line: { color: C.teal, width: 0.5 }, shadow: makeShadow() });
      slide.addText(c.num, { x: x + 0.1, y: y + 0.08, w: 0.45, h: 0.65, fontSize: 18, fontFace: "Cambria", color: C.teal, bold: true, align: "center", margin: 0 });
      slide.addText(c.firm, { x: x + 0.62, y: y + 0.08, w: 3.6, h: 0.38, fontSize: 11, fontFace: "Calibri", color: C.white, bold: true, margin: 0 });
      slide.addText(c.key, { x: x + 0.62, y: y + 0.46, w: 3.6, h: 0.28, fontSize: 9.5, fontFace: "Calibri", color: C.cyan, margin: 0 });
    });
  });
}

// ─────────────────────────────────────────────────────────────
// Helper: Use Case Slide
// ─────────────────────────────────────────────────────────────
function addUseCaseSlide({ num, title, subtitle, firm, firmSub, problem, solution, metric }) {
  const slide = pres.addSlide();
  slide.background = { color: C.dark };

  // Top label + number
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 0.22, w: 0.6, h: 0.38, fill: { color: C.teal }, rectRadius: 0.06, line: { color: C.teal, width: 0 } });
  slide.addText(num, { x: 0.4, y: 0.22, w: 0.6, h: 0.38, fontSize: 14, fontFace: "Cambria", color: C.dark, bold: true, align: "center", margin: 0 });

  slide.addText(title, { x: 1.15, y: 0.22, w: 8.5, h: 0.4, fontSize: 20, fontFace: "Cambria", color: C.white, bold: true, margin: 0 });
  slide.addText(subtitle, { x: 1.15, y: 0.62, w: 8.5, h: 0.28, fontSize: 11, fontFace: "Calibri", color: C.gray, margin: 0 });

  // Divider
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 1.0, w: 9.2, h: 0.02, fill: { color: "1E3A5F" }, line: { color: "1E3A5F", width: 0 } });

  // FIRM box
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 1.1, w: 9.2, h: 0.58, fill: { color: C.navy }, rectRadius: 0.08, line: { color: "1E3A5F", width: 1 } });
  slide.addText("🏢  STAKEHOLDER / END USER", { x: 0.55, y: 1.12, w: 2.2, h: 0.24, fontSize: 8, fontFace: "Calibri", color: C.cyan, bold: true, charSpacing: 2, margin: 0 });
  slide.addText(firm, { x: 0.55, y: 1.34, w: 4.2, h: 0.26, fontSize: 13, fontFace: "Cambria", color: C.white, bold: true, margin: 0 });
  slide.addText(firmSub, { x: 4.8, y: 1.18, w: 4.6, h: 0.38, fontSize: 9.5, fontFace: "Calibri", color: C.gray, italic: true, margin: 0 });

  // PROBLEM column
  const pY = 1.85;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: pY, w: 4.4, h: 3.4, fill: { color: "1A1010" }, rectRadius: 0.1, line: { color: "FF6B35", width: 1 }, shadow: makeShadow() });
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: pY, w: 4.4, h: 0.45, fill: { color: C.orange }, rectRadius: 0.1, line: { color: C.orange, width: 0 } });
  slide.addText("⚠  THE CHALLENGE — WHY NOT WI-FI / 4G?", { x: 0.5, y: pY + 0.06, w: 4.2, h: 0.33, fontSize: 9, fontFace: "Calibri", color: C.white, bold: true, charSpacing: 1, margin: 0 });

  slide.addText(problem.map((t, i) => ({
    text: t, options: { bullet: true, breakLine: i < problem.length - 1, color: i === 0 ? C.white : C.gray, fontSize: 11, fontFace: "Calibri", paraSpaceAfter: 5 }
  })), { x: 0.55, y: pY + 0.55, w: 4.1, h: 2.7, margin: 0 });

  // SOLUTION column
  const sY = 1.85;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.2, y: sY, w: 4.4, h: 3.4, fill: { color: "0A1A14" }, rectRadius: 0.1, line: { color: "06D6A0", width: 1 }, shadow: makeShadow() });
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.2, y: sY, w: 4.4, h: 0.45, fill: { color: C.green }, rectRadius: 0.1, line: { color: C.green, width: 0 } });
  slide.addText("✅  THE 5G PLUS SOLUTION", { x: 5.3, y: sY + 0.06, w: 4.2, h: 0.33, fontSize: 9, fontFace: "Calibri", color: C.dark, bold: true, charSpacing: 1, margin: 0 });

  slide.addText(solution.map((t, i) => ({
    text: t, options: { bullet: true, breakLine: i < solution.length - 1, color: i === 0 ? C.white : "B2F7E5", fontSize: 11, fontFace: "Calibri", paraSpaceAfter: 5 }
  })), { x: 5.35, y: sY + 0.55, w: 4.1, h: 2.7, margin: 0 });

  // Metric bar at bottom
  if (metric) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 5.28, w: 9.2, h: 0.24, fill: { color: "0D2137" }, rectRadius: 0.05, line: { color: C.teal, width: 0.5 } });
    slide.addText("📊  " + metric, { x: 0.55, y: 5.28, w: 9.0, h: 0.24, fontSize: 9.5, fontFace: "Calibri", color: C.cyan, margin: 0 });
  }
}

// ─────────────────────────────────────────────────────────────
// SLIDE: COMPARISON CHART
// ─────────────────────────────────────────────────────────────
function addComparisonSlide() {
  const slide = pres.addSlide();
  slide.background = { color: C.dark };

  slide.addText("TECHNOLOGY COMPARISON", { x: 0.5, y: 0.25, w: 9, h: 0.3, fontSize: 9, fontFace: "Calibri", color: C.cyan, bold: true, charSpacing: 4, margin: 0 });
  slide.addText("Wi-Fi / 4G vs. 5G Plus — Key Metrics", { x: 0.5, y: 0.55, w: 9, h: 0.5, fontSize: 24, fontFace: "Cambria", color: C.white, bold: true, margin: 0 });

  // Latency chart
  slide.addChart(pres.charts.BAR, [
    {
      name: "Latency (ms)",
      labels: ["Wi-Fi (Handover)", "4G/LTE", "5G SA (URLLC)"],
      values: [1500, 50, 5],
    }
  ], {
    x: 0.4, y: 1.2, w: 4.5, h: 3.5,
    barDir: "col",
    chartColors: [C.orange, "F4A261", C.green],
    chartArea: { fill: { color: C.navy }, roundedCorners: true },
    catAxisLabelColor: C.gray,
    valAxisLabelColor: C.gray,
    valGridLine: { color: "1E3A5F", size: 0.5 },
    catGridLine: { style: "none" },
    showValue: true,
    dataLabelColor: C.white,
    showLegend: false,
    showTitle: true,
    title: "Latency (ms) - Lower is Better",
    titleColor: C.cyan,
    titleFontSize: 12,
  });

  // Throughput chart
  slide.addChart(pres.charts.BAR, [
    {
      name: "Throughput (Mbps)",
      labels: ["Wi-Fi 5", "4G/LTE", "5G SA (eMBB)"],
      values: [150, 100, 2000],
    }
  ], {
    x: 5.2, y: 1.2, w: 4.5, h: 3.5,
    barDir: "col",
    chartColors: [C.orange, "F4A261", C.teal],
    chartArea: { fill: { color: C.navy }, roundedCorners: true },
    catAxisLabelColor: C.gray,
    valAxisLabelColor: C.gray,
    valGridLine: { color: "1E3A5F", size: 0.5 },
    catGridLine: { style: "none" },
    showValue: true,
    dataLabelColor: C.white,
    showLegend: false,
    showTitle: true,
    title: "Bandwidth (Mbps) - Higher is Better",
    titleColor: C.cyan,
    titleFontSize: 12,
  });

  // Key callouts
  const kpis = [
    { label: "< 5 ms", desc: "URLLC Latency Guarantee" },
    { label: "2 Gbps", desc: "eMBB Max Throughput" },
    { label: "99.9999%", desc: "URLLC Reliability" },
    { label: "0 Drops", desc: "Seamless Handover" },
  ];
  kpis.forEach((k, i) => {
    const x = 0.4 + i * 2.35;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 5.0, w: 2.2, h: 0.55, fill: { color: C.navy }, rectRadius: 0.07, line: { color: C.teal, width: 0.8 } });
    slide.addText(k.label, { x, y: 5.02, w: 2.2, h: 0.28, fontSize: 15, fontFace: "Cambria", color: C.teal, bold: true, align: "center", margin: 0 });
    slide.addText(k.desc, { x, y: 5.3, w: 2.2, h: 0.2, fontSize: 8.5, fontFace: "Calibri", color: C.gray, align: "center", margin: 0 });
  });
}

// ─────────────────────────────────────────────────────────────
// SLIDE: CLOSING
// ─────────────────────────────────────────────────────────────
function addClosingSlide() {
  const slide = pres.addSlide();
  slide.background = { color: C.dark };

  slide.addShape(pres.shapes.OVAL, { x: 6.5, y: -0.5, w: 4, h: 4, fill: { color: C.teal, transparency: 88 }, line: { color: C.teal, width: 1, transparency: 65 } });
  slide.addShape(pres.shapes.OVAL, { x: -1.2, y: 3.0, w: 3.5, h: 3.5, fill: { color: C.cyan, transparency: 90 }, line: { color: C.cyan, width: 1, transparency: 70 } });

  slide.addText("CONCLUSION", { x: 1, y: 0.7, w: 8, h: 0.3, fontSize: 10, fontFace: "Calibri", color: C.cyan, bold: true, charSpacing: 5, align: "center", margin: 0 });
  slide.addText("5G Plus — The Wireless Backbone\nof the Autonomous Future", { x: 0.8, y: 1.1, w: 8.4, h: 1.1, fontSize: 30, fontFace: "Cambria", color: C.white, bold: true, align: "center", margin: 0 });

  slide.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 2.35, w: 3.0, h: 0.03, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });

  const points = [
    "Wi-Fi handover issues resolved → 5G SA seamless connectivity",
    "4G bandwidth bottlenecks eliminated → eMBB Gigabit data transfer",
    "Network congestion prevented → Network Slicing for guaranteed pipelines",
    "Underground & remote coverage achieved → Leaky Feeder & Nomadic Nodes",
    "Heavy on-board processing reduced → Edge Cloud + URLLC offloading",
  ];
  slide.addText(points.map((p, i) => ({
    text: "→  " + p, options: { breakLine: i < points.length - 1, color: i % 2 === 0 ? C.white : C.cyan, fontSize: 12, fontFace: "Calibri", paraSpaceAfter: 4 }
  })), { x: 1.2, y: 2.55, w: 7.6, h: 2.5, align: "left", margin: 0 });

  slide.addText("TU Wien IFT  ·  A1 Telekom  ·  5GEARING  ·  5G CONNI  ·  Vienna 5G Simulators", {
    x: 1, y: 5.25, w: 8, h: 0.28, fontSize: 9, fontFace: "Calibri", color: C.gray, align: "center", margin: 0
  });
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
async function main() {
  await addTitleSlide();
  await addOverviewSlide();

  addUseCaseSlide({
    num: "01",
    title: "Logistics AMR Fleet Management — Seamless Handover",
    subtitle: "A1 Telekom Austria  ·  ARTI - Autonomy for Robots  ·  CANCOM Austria  |  5GEARING Project",
    firm: "Large-Scale Logistics Warehouse Operators",
    firmSub: "Context: Nationally funded 5GEARING project focusing on 5G adaptation in manufacturing & logistics",
    problem: [
      "AMRs experience handovers when moving between Wi-Fi Access Points",
      "Connection can drop for 500 ms to 2 seconds during a handover",
      "ROS2 heartbeat signal loss triggers emergency safety braking",
      "Constant stop-and-go in large fleets paralyzes logistics workflows",
      "Industrial EMI (electromagnetic interference) highly degrades Wi-Fi",
    ],
    solution: [
      "A1 Private 5G SA operates on licensed bands, immune to industrial EMI",
      "Cellular handovers guarantee zero-drop connectivity with <10 ms transition",
      "ARTI ROS2 stack streams SLAM data seamlessly to fleet managers",
      "Mechanical stop-and-go behaviors are entirely prevented",
      "CANCOM integration provides real-time network optimization analytics",
    ],
    metric: "Result: +25% Operational Efficiency  ·  Zero Heartbeat Loss  ·  Continuous Fleet Flow",
  });

  addUseCaseSlide({
    num: "02",
    title: "Edge-SLAM & Computation Offloading",
    subtitle: "TU Wien IFT  ·  Blue Danube Robotics (AIRSKIN)  |  EU-Funded 5G CONNI Project",
    firm: "TU Wien — IFT & Blue Danube Robotics",
    firmSub: "Context: 5G CONNI transnational Private 5G & Edge Cloud testbed for Industry 4.0",
    problem: [
      "Fully autonomous AMRs must carry 3D LiDAR, depth cameras, and heavy Edge GPUs",
      "On-board hardware costs skyrocket and significantly increase payload weight",
      "High power consumption dramatically reduces autonomous battery life",
      "AIRSKIN safety tactile data requires millisecond-level processing",
      "4G LTE bandwidth cannot handle raw 3D LiDAR point cloud streaming",
    ],
    solution: [
      "5G CONNI architecture shifts the robot's 'brain' to the local Edge Cloud",
      "Robot streams raw sensor data using high-throughput 5G eMBB uplink",
      "Powerful Edge servers run simultaneous localization, mapping, and AI perception",
      "URLLC loop provides wired-like stability (<1 ms round-trip airtime)",
      "Lightweight on-board hardware extends battery life and cuts robot unit costs",
    ],
    metric: "Result: Reduced Unit Cost  ·  Extended Battery Life  ·  Fenceless HRC via AIRSKIN",
  });

  addUseCaseSlide({
    num: "03",
    title: "Network Slicing — Mission-Critical Isolation",
    subtitle: "A1 Telekom  ·  TU Wien Institute of Telecommunications  ·  Smart Factory Facilities",
    firm: "Siemens Seestadt Aspern & Pilot Smart Factories (Vienna)",
    firmSub: "Context: TU Wien's Vienna 5G Simulator optimizes cellular slicing parameters",
    problem: [
      "IoT sensors, high-res CCTV, office traffic, and AMRs share the same band",
      "Large data bursts generate heavy packet congestion in standard networks",
      "Robot arm 'Emergency Stop' or trajectory corrections experience latency (>100 ms)",
      "In industrial automation, such delays result in collisions or line stops",
      "Wi-Fi cannot provide deterministic QoS guarantees; traffic prioritization fails",
    ],
    solution: [
      "Slice 1 — Critical Control: AMR + robotic arm ROS2/PROFINET over 5G (<5 ms guaranteed)",
      "Slice 2 — High Bandwidth: Real-time computer vision quality control (High Mbps eMBB)",
      "Slice 3 — General Traffic: Office personnel, standard data transfers",
      "Slice 1 remains completely untouched regardless of heavy data spikes on Slice 2 or 3",
      "Parameters are dynamically modeled using the TU Wien Vienna 5G Simulator",
    ],
    metric: "Result: Zero Control Latency  ·  Uninterrupted Production Lines  ·  PROFINET over 5G",
  });

  addUseCaseSlide({
    num: "04",
    title: "ÖBB — Railway Infrastructure & Safety Inspection",
    subtitle: "Österreichische Bundesbahnen  ·  Zentralverschiebebahnhof Wien-Kledering",
    firm: "ÖBB (Austrian Federal Railways)",
    firmSub: "Context: Massive open yards where deployment of static Wi-Fi is physically impossible",
    problem: [
      "Vienna's massive marshalling yards cover kilometers of changing environments",
      "Deploying standard Wi-Fi across this scale is too costly and causes dead zones",
      "Standard 4G yields high latency and inadequate uplink for raw thermal/LiDAR data",
      "If the signal drops, autonomous safety inspections freeze, creating security gaps",
      "UGVs like Boston Dynamics Spot cannot operate BVLOS without reliable links",
    ],
    solution: [
      "Cellular 5G SA coverage natively integrated across major ÖBB corridors",
      "BVLOS (Beyond Visual Line of Sight) deployment with zero local operators",
      "UGVs stream real-time thermal, video, and LiDAR payloads directly to cloud instances",
      "Autonomous AI pipelines parse data instantly to detect track micro-fractures",
      "Signal drop risk is completely eliminated, enabling constant 24/7 security sweeps",
    ],
    metric: "Result: Lower Inspection Cost  ·  Early Fault Detection  ·  Enhanced Rail Safety",
  });

  addUseCaseSlide({
    num: "05",
    title: "Wiener Linien — Subway Tunnel Inspection & Maintenance",
    subtitle: "Wiener Linien  ·  U-Bahn (Focus on the new fully automated U5 Line)  ·  Night Shift Patrols",
    firm: "Wiener Linien (Vienna Public Transport)",
    firmSub: "Context: Inspecting track wear and water leakages in deep underground tunnels during night shifts",
    problem: [
      "Installing dense Wi-Fi networks in underground tunnels faces rapid signal attenuation",
      "4G LTE bottlenecks under heavy 3D environmental mapping data streams",
      "The driverless U5 line requires the absolute highest automation and safety standards",
      "Night maintenance windows are extremely tight; rapid data sync is mandatory",
      "Deep underground topology blocks traditional long-range uplink signals to the surface",
    ],
    solution: [
      "Deployment of 5G URLLC utilizing Leaky Feeder cables running through the tunnels",
      "Tracked/wheeled inspection robots deploy instantly as the passenger tracks close",
      "Gigabit-level point cloud datasets sync directly to the control center over eMBB",
      "URLLC ensures ultra-low latency inputs for instantaneous remote manual overrides",
      "3D volumetric maps are compiled seamlessly on the surface to clear tracks before dawn",
    ],
    metric: "Result: Optimized Maintenance Windows  ·  Early Structural Alerting  ·  U5 Compliant",
  });

  addUseCaseSlide({
    num: "06",
    title: "Österreichische Post — Autonomous Last-Mile Delivery",
    subtitle: "Österreichische Post AG  ·  Mariahilfer Straße & Urban Autonomous Delivery Trials",
    firm: "Österreichische Post AG (Austrian Post)",
    firmSub: "Context: Pedestrian-dense urban zones where standard commercial networks choke",
    problem: [
      "Utilizing Wi-Fi across public city streets is physically and logistically impossible",
      "Public 4G towers face heavy congestion from regular citizens streaming media",
      "Congestion delays navigation updates, creating real collision risks with pedestrians",
      "Emergency 'Object Detected - Halt' fallback overrides can be delayed by cell load",
      "Safety metrics cannot be mathematically guaranteed on highly crowded caddes",
    ],
    solution: [
      "Network Slicing: Austrian Post acquires a dedicated 'Critical Public Robot' slice (A1/Magenta)",
      "Regardless of local cell congestion from pedestrians, the robot's slice bandwidth is walled off",
      "Safety alerts achieve a guaranteed <2 ms airtime response loop directly to edge clusters",
      "Enables continuous, reliable autonomous delivery along dense corridors like Mariahilfer Straße",
      "Highly scalable: new delivery bots seamlessly claim pre-allocated slice priority tokens",
    ],
    metric: "Result: Guaranteed 2 ms Safety Loop  ·  Immunity to Public Load  ·  Secure Last-Mile",
  });

  addUseCaseSlide({
    num: "07",
    title: "Flughafen Wien — Apron Autonomous Cargo & UGV Management",
    subtitle: "Flughafen Wien AG (Vienna International Airport)  ·  Apron UGVs & Ground Support Equipment",
    firm: "Flughafen Wien AG",
    firmSub: "Context: High-EMI environment due to ground radars, transponders, and avionics",
    problem: [
      "Airport aprons are heavily saturated with EMI (radar arrays, avionics, radio towers)",
      "Wi-Fi presents severe cyber-vulnerabilities and high geometric shadow dropouts",
      "Delays in autonomous baggage towing tractors directly trigger cascading flight delays",
      "Traditional GPS/GNSS signals frequently degrade around massive metal hangars",
      "Standard 4G lacks the sub-meter localization accuracy needed for tight tarmac positioning",
    ],
    solution: [
      "Dedicated Private 5G SA enterprise network operating on interference-free bands",
      "Centralized orchestration plane tracks all autonomous tugs and ground units simultaneously",
      "Leverages native 5G Positioning tech to maintain ultra-precise centimeter-level location telemetry",
      "V2X (Vehicle-to-Everything) links are completely isolated from radar interference",
      "Dynamic path optimization routing minimizes ground handling lag and turnarounds",
    ],
    metric: "Result: Centimeter-Level Precision  ·  Minimized Turnaround Lag  ·  Maximized Apron Security",
  });

  addUseCaseSlide({
    num: "08",
    title: "STRABAG / PORR — Construction Site 3D LiDAR Scanning",
    subtitle: "STRABAG SE  ·  PORR AG  ·  Vienna Urban Development Zones  ·  BIM Digital Twin Integration",
    firm: "STRABAG SE & PORR AG",
    firmSub: "Context: Rapidly changing structural shapes where fixed layouts are unfeasible",
    problem: [
      "Construction environments change daily; running static data backhauls is impossible",
      "Automated BIM (Building Information Modeling) validation requires daily 3D LiDAR sweeps",
      "Resulting raw Point Cloud datasets scale up to massive gigabyte profiles",
      "Uploading over 4G takes hours, delaying verification and leaving faults unaddressed",
      "Structural discrepancies caught weeks later generate massive structural rework costs",
    ],
    solution: [
      "Deployment of a rapidly towable, temporary 5G Plus field base station (Nomadic Node)",
      "Mobile scanning units cross the site and pipe point clouds over high-speed 5G eMBB uplink",
      "Gigabytes of volumetric site data sync to the engineering trailer in seconds",
      "Automated routines match the scan against the BIM model for real-time anomaly detection",
      "As the job concludes, the Nomadic Node rolls to the next location with zero infrastructure loss",
    ],
    metric: "Result: Sync Windows Trimmed to Seconds  ·  Instant Anomaly Detection  ·  BIM Verification",
  });

  addComparisonSlide();
  addClosingSlide();

  // Optimized file export path for universal execution
  await pres.writeFile({ fileName: "5G_Vienna_Robotics_UseCases.pptx" });
  console.log("SUCCESS: Presentation generated as '5G_Vienna_Robotics_UseCases.pptx'");
}

main().catch(console.error);