// quasar.config.js
module.exports = function (ctx) {
  return {
    // ...
    framework: {
      plugins: [
        'Dialog', // Add this line
        'Notify', // You probably already have this
        // ... other plugins
      ],
    },
    // ...
  };
};
