#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

// Declare your module as an RCTBridgeModule to expose it to React Native
// Also inherit from RCTEventEmitter to be able to send events to JavaScript
@interface DeviceBatteryInfo : RCTEventEmitter <RCTBridgeModule>

@end