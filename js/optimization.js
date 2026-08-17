/**
 * ONLY4YOU Optimization Utility
 * Detects low-end devices and applies performance optimizations.
 */

const Optimization = {
  isLowEnd: false,
  isMobile: false,

  init() {
    this.detectDevice();
    this.applyGlobalTuning();
  },

  detectDevice() {
    // Detect mobile
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Detect low RAM (Most browsers report this in GB)
    // We consider <= 4GB as low-end for this project's heavy effects
    const memory = navigator.deviceMemory || 8; // Default to 8 if not supported
    
    // Also check logical processors as a proxy for CPU power
    const cores = navigator.hardwareConcurrency || 4;

    this.isLowEnd = (memory <= 4) || (this.isMobile && cores <= 4);

    console.log(`[ONLY4YOU Optimization] Mobile: ${this.isMobile}, Low-End: ${this.isLowEnd} (RAM: ${memory}GB, Cores: ${cores})`);
  },

  applyGlobalTuning() {
    if (this.isLowEnd) {
      document.body.classList.add('performance-optimized');
      
      if (!document.getElementById('opt-styles')) {
        const style = document.createElement('style');
        style.id = 'opt-styles';
        style.textContent = `
          .performance-optimized .hide-on-low-end {
            display: none !important;
          }

          .performance-optimized {
            text-rendering: speed;
            -webkit-font-smoothing: auto;
          }
        `;
        document.head.appendChild(style);
      }
    }
  },

  /**
   * Helper to throttle functions
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }
};

// Auto-init on script load
Optimization.init();

export default Optimization;
