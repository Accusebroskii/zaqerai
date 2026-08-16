export const DISCORD_SERVER_URL = "https://discord.gg/zaqerai";
export const X_PROFILE_URL = "https://x.com/ZaqeraiTweaks";

export const DEFAULT_EMBED_COLOR = 0x7c3aed;

export const ticketCopy = {
  panelTitle: "Need help? Open a ticket",
  panelDescription:
    "Click the button below to open a private ticket with the Zaqerai Optimizations team.",
  openMessage:
    "Thanks for reaching out. Please describe what you need help with and include your PC specs if relevant.",
  closeButton: "Close ticket",
  closeMessage: "This ticket will be deleted in a few seconds.",
} as const;

export type TicketSettings = {
  panelTitle: string;
  panelDescription: string;
  openMessage: string;
  closeButton: string;
  closeMessage: string;
  embedColor: number;
};

export const defaultTicketSettings: TicketSettings = {
  ...ticketCopy,
  embedColor: DEFAULT_EMBED_COLOR,
};

export const termsOfService = [
  "📜 **Terms of Service**",
  "",
  "🚫 **No Refunds**",
  "Once you pay, you cannot get your money back for any reason.",
  "",
  "⚖️ **No Chargebacks**",
  "If you try to charge back or dispute the payment, your service will be removed and you will be banned from buying again. We may also try to get the money back.",
  "",
  "📋 **About the Service**",
  "You are buying a digital PC optimization service. Results can be different for everyone depending on your computer and setup.",
  "",
  "🔒 **No Sharing or Reselling**",
  "You cannot share, resell, leak, or edit our tweaks. Doing so will remove your access and could lead to further legal action.",
  "",
  "✅ **Payment Rules**",
  "You must use a payment method that belongs to you and follow all Discord and payment platform rules.",
  "",
  "🧪 **Stability**",
  "Before buying the optimization service, make sure your PC is running at safe temperatures and is stable. You can check temperatures and confirm stability by running stress tests.",
  "",
  "⚠️ **Important**",
  "By paying, you confirm you read and agree to everything above.",
  "If you break these rules, you lose access with no refund.",
].join("\n");

export const optimizationServices = [
  "📈 **Optimization Services**",
  "Get more performance from your hardware by safely and reliably overclocking.",
  "",
  "**Essential Optimization - $20**",
  "• Custom OS Installation (ZaqOS)",
  "• Full Windows Optimization",
  "• Custom Power Plan for Maximum Performance",
  "• Network Tweaks",
  "",
  "**Full System Optimization - $40**",
  "• Custom OS Installation (ZaqOS)",
  "• Full Windows Optimization",
  "• Full BIOS Optimization including Hidden Settings",
  "• CPU & GPU Optimization",
  "• Custom Power Plan for Maximum Performance",
  "• Network Tweaks",
  "• Removal of Power-saving, Unnecessary Limits & Throttles",
  "",
  "**Ultimate Optimization - $70**",
  "• Custom OS Installation (ZaqOS)",
  "• Full System Optimization - $40",
  "• CPU Overclocking - $25",
  "• GPU Overclocking - $15",
  "",
  "This is THE BEST Service to purchase to get Maximum Performance from your PC!",
  "",
  "#️⃣ 📩 | **make-ticket**",
].join("\n");

export const overclockingServices = [
  "🚀 **Overclocking Services**",
  "Get more performance from your hardware by safely and reliably overclocking.",
  "",
  "**Bios Tuning - $15**",
  "• Boost Performance & Stability",
  "• 200-300+ BIOS Settings Optimized",
  "• Perfect Balance of Stability",
  "",
  "**GPU Overclocking - $15**",
  "• Boost GPU clock and memory speeds",
  "• Higher FPS & Stable Frames",
  "• Next Level Responsiveness",
  "",
  "**CPU Overclocking - $25**",
  "• Safe yet Aggressive Overclocking",
  "• Higher FPS, Improved 1%, 0.1% Lows",
  "• Ultra Low Latency",
  "",
  "**RAM Overclocking - $50**",
  "• Tuned for Higher Speeds & Tighter Timings",
  "• Higher FPS & Stable Frames",
  "• Elite Ultra Low Latency",
  "",
  "🕐 **Session Details**",
  "Length: Approximately 30-150 minutes",
  "Done remotely using AnyDesk or RustDesk & Discord Voice Call",
  "",
  "❓ **Is this safe?**",
  "Yes! Every overclock is done Safely for Stable overclocks, it's fully tested, lifetime support guaranteed.",
  "",
  "📩 | **make-ticket**",
].join("\n");