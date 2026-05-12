declare module "aos" {
  type DisableOption = boolean | "phone" | "tablet" | "mobile" | (() => boolean);

  interface AosOptions {
    anchorPlacement?: string;
    debounceDelay?: number;
    delay?: number;
    disable?: DisableOption;
    disableMutationObserver?: boolean;
    duration?: number;
    easing?: string;
    mirror?: boolean;
    offset?: number;
    once?: boolean;
    startEvent?: string;
    throttleDelay?: number;
  }

  interface Aos {
    init(options?: AosOptions): void;
    refresh(): void;
    refreshHard(): void;
  }

  const AOS: Aos;
  export default AOS;
}
