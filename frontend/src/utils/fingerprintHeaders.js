const buildFingerprintHeaders = () => {
  return {
    'X-Viewport-Width': window.innerWidth.toString(),
    'X-Viewport-Height': window.innerHeight.toString(),
    'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
    'X-Screen-Resolution': `${screen.width}x${screen.height}`,
    'X-Platform': navigator.platform,
    'X-Hardware-Concurrency': navigator.hardwareConcurrency.toString(),
  };
};

export default buildFingerprintHeaders;
