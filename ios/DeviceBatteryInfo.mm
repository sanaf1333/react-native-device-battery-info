#import "DeviceBatteryInfo.h"
#import <UIKit/UIKit.h> // Required for UIDevice and battery monitoring

@implementation DeviceBatteryInfo

// Expose the module to React Native with a specific name.
// If not specified, the class name will be used (e.g., "DeviceBatteryInfo")
RCT_EXPORT_MODULE(ReactNativeDeviceBatteryInfo);

// Event name constant for battery status changes
static NSString *const BATTERY_STATUS_EVENT = @"onBatteryStatusChange";

// MARK: - RCTEventEmitter Methods

// Define the events that this module can emit to JavaScript
- (NSArray<NSString *> *)supportedEvents {
    return @[BATTERY_STATUS_EVENT];
}

// This method is called when the first listener is added to an event.
// Use it to start native observers/listeners.
- (void)startObserving {
    [self startBatteryStatusListener];
}

// This method is called when the last listener for an event is removed.
// Use it to stop native observers/listeners.
- (void)stopObserving {
    [self stopBatteryStatusListener];
}

// MARK: - Public React Native Methods

/**
 * @brief Gets the current battery level and charging status.
 * @param resolve A promise resolver block to return the result to JavaScript.
 * @param reject A promise rejecter block to return errors to JavaScript.
 */
RCT_EXPORT_METHOD(getBatteryStatus:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // All UI-related tasks (like accessing UIDevice) must be on the main thread
    dispatch_async(dispatch_get_main_queue(), ^{
        @try {
            // Enable battery monitoring (important!)
            [[UIDevice currentDevice] setBatteryMonitoringEnabled:YES];

            float batteryLevel = [UIDevice currentDevice].batteryLevel; // -1.0 to 1.0, 1.0 is 100%

            // *** FIX: Multiply by 100 to get a percentage (0-100) ***
            if (batteryLevel < 0) { // If unknown, treat as 0 or handle specifically
                batteryLevel = 0.0;
            } else {
                batteryLevel = batteryLevel * 100.0; // Convert to 0-100 range
            }
            // *** END FIX ***


            UIDeviceBatteryState batteryState = [UIDevice currentDevice].batteryState;

            BOOL isCharging = (batteryState == UIDeviceBatteryStateCharging ||
                               batteryState == UIDeviceBatteryStateFull);

            NSDictionary *result = @{
                @"level": @(batteryLevel), // Convert float to NSNumber
                @"isCharging": @(isCharging)
            };
            resolve(result);
        } @catch (NSException *exception) {
            reject(@"BATTERY_STATUS_ERROR", exception.reason, nil);
        }
    });
}

/**
 * @brief Starts listening for battery status changes and emits events to JavaScript.
 * Note: This method is primarily exposed for manual control, but `startObserving`
 * will automatically call it when JS adds the first event listener.
 */
RCT_EXPORT_METHOD(startBatteryStatusListener) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [[UIDevice currentDevice] setBatteryMonitoringEnabled:YES]; // Ensure monitoring is enabled

        // Add observers for battery level and state changes
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(batteryLevelDidChange:)
                                                     name:UIDeviceBatteryLevelDidChangeNotification
                                                   object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(batteryStateDidChange:)
                                                     name:UIDeviceBatteryStateDidChangeNotification
                                                   object:nil];
         // Send an initial event when listener starts if battery info is available
        [self sendBatteryStatusEvent]; // Trigger an initial event for consistency with Android
    });
}

/**
 * @brief Stops listening for battery status changes.
 * Note: This method is primarily exposed for manual control, but `stopObserving`
 * will automatically call it when JS removes the last event listener.
 */
RCT_EXPORT_METHOD(stopBatteryStatusListener) {
    dispatch_async(dispatch_get_main_queue(), ^{
        // Remove observers
        [[NSNotificationCenter defaultCenter] removeObserver:self
                                                        name:UIDeviceBatteryLevelDidChangeNotification
                                                      object:nil];
        [[NSNotificationCenter defaultCenter] removeObserver:self
                                                        name:UIDeviceBatteryStateDidChangeNotification
                                                      object:nil];
        // It's good practice to disable monitoring when not needed to save power
        [[UIDevice currentDevice] setBatteryMonitoringEnabled:NO];
    });
}

// MARK: - Notification Handlers (Internal)

/**
 * @brief Handles UIDeviceBatteryLevelDidChangeNotification.
 * @param notification The notification object.
 */
- (void)batteryLevelDidChange:(NSNotification *)notification {
    [self sendBatteryStatusEvent];
}

/**
 * @brief Handles UIDeviceBatteryStateDidChangeNotification.
 * @param notification The notification object.
 */
- (void)batteryStateDidChange:(NSNotification *)notification {
    [self sendBatteryStatusEvent];
}

/**
 * @brief Helper method to gather battery info and send it as an event to JavaScript.
 */
- (void)sendBatteryStatusEvent {
    dispatch_async(dispatch_get_main_queue(), ^{
        // Ensure monitoring is enabled before trying to read values
        [[UIDevice currentDevice] setBatteryMonitoringEnabled:YES];

        float batteryLevel = [UIDevice currentDevice].batteryLevel;

        // *** FIX: Multiply by 100 to get a percentage (0-100) ***
        if (batteryLevel < 0) { // If unknown, treat as 0 or handle specifically
            batteryLevel = 0.0;
        } else {
            batteryLevel = batteryLevel * 100.0; // Convert to 0-100 range
        }
        // *** END FIX ***

        UIDeviceBatteryState batteryState = [UIDevice currentDevice].batteryState;
        BOOL isCharging = (batteryState == UIDeviceBatteryStateCharging ||
                           batteryState == UIDeviceBatteryStateFull);

        NSDictionary *result = @{
            @"level": @(batteryLevel),
            @"isCharging": @(isCharging)
        };

        // Send the event to JavaScript
        [self sendEventWithName:BATTERY_STATUS_EVENT body:result];
    });
}

// MARK: - Lifecycle (Optional but good practice)

// Deallocate observers when the module is deallocated
- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    // Ensure battery monitoring is turned off when the module is no longer in use
    [[UIDevice currentDevice] setBatteryMonitoringEnabled:NO];
}

@end