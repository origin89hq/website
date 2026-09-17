export const siteConfig = {
  origin: "https://origin89.com",
  github: "https://github.com/origin89hq",
  data: "https://data.origin89.com",
  repositories: {
    km43: "https://github.com/origin89hq/km43",
    data: "https://github.com/origin89hq/data",
    hardware: "https://github.com/origin89hq/hardware",
    camera: "https://github.com/origin89hq/camera",
    brand: "https://github.com/origin89hq/brand",
  },
  docs: "https://docs.origin89.com",
  protocol: "https://docs.origin89.com/km43/",
  email: "hello@origin89.com",
  // Public Turnstile site key for the waitlist. Its secret is a Worker secret.
  turnstileSiteKey: "0x4AAAAAAE6bTBHHAlrTHTna",
};
export const siteNavigation = [
  ["Products", "/products/"],
  ["Equipment", "/equipment/"],
  ["Your site", "/sites/"],
  ["Developers", "/developers/"],
] as const;
