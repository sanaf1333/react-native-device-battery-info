package com.devicebatteryinfo

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.LifecycleEventListener

class ReactNativeDeviceBatteryInfoModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext),
    LifecycleEventListener {

    private var batteryStatusReceiver: android.content.BroadcastReceiver? = null
    private var isReceiverRegistered = false

    companion object {
        const val NAME = "ReactNativeDeviceBatteryInfo"
        const val BATTERY_STATUS_EVENT = "onBatteryStatusChange"
    }

    init {
        reactContext.addLifecycleEventListener(this)
    }

    override fun getName(): String {
        return NAME
    }

    private fun sendEvent(eventName: String, params: Any?) {
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        } else {
            Log.w(NAME, "Cannot send event. React Native Catalyst instance not active.")
        }
    }

    @ReactMethod
    fun getBatteryStatus(promise: Promise) {
        try {
            val batteryStatus = getBatteryInfo()
            promise.resolve(batteryStatus)
        } catch (e: Exception) {
            Log.e(NAME, "Error getting battery status: ${e.message}", e)
            promise.reject("BATTERY_STATUS_ERROR", "Failed to get battery status", e)
        }
    }

    @ReactMethod
    fun startBatteryStatusListener() {
        if (isReceiverRegistered) {
            Log.w(NAME, "Battery status listener already started. Skipping.")
            return
        }

        batteryStatusReceiver = object : android.content.BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                if (intent?.action == Intent.ACTION_BATTERY_CHANGED) {
                    val batteryInfo = getBatteryInfo(intent) // This creates a new WritableMap
                    // --- MODIFICATION HERE ---
                    // Log the information BEFORE passing the WritableMap to sendEvent
                    Log.d(NAME, "Battery status updated via listener: Level=${batteryInfo.getDouble("level")}, Charging=${batteryInfo.getBoolean("isCharging")}")

                    sendEvent(BATTERY_STATUS_EVENT, batteryInfo) // This consumes the WritableMap
                    // --- END MODIFICATION ---
                }
            }
        }
        val intentFilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        try {
            reactContext.registerReceiver(batteryStatusReceiver, intentFilter)
            isReceiverRegistered = true
            Log.d(NAME, "Started listening for battery status changes.")
        } catch (e: Exception) {
            Log.e(NAME, "Error registering battery status receiver: ${e.message}", e)
            batteryStatusReceiver = null
            isReceiverRegistered = false
        }
    }

    @ReactMethod
    fun stopBatteryStatusListener() {
        if (isReceiverRegistered && batteryStatusReceiver != null) {
            try {
                reactContext.unregisterReceiver(batteryStatusReceiver)
                isReceiverRegistered = false
                batteryStatusReceiver = null
                Log.d(NAME, "Stopped listening for battery status changes.")
            } catch (e: IllegalArgumentException) {
                Log.w(NAME, "Attempted to unregister a receiver that was not registered: ${e.message}")
            }
        } else {
            Log.d(NAME, "Battery status listener not active. Nothing to stop.")
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        Log.d(NAME, "addListener called for event: $eventName")
    }

    @ReactMethod
    fun removeListeners(count: Double) {
        Log.d(NAME, "removeListeners called with count: $count")
    }

    override fun onHostResume() {
        Log.d(NAME, "onHostResume: Host resumed.")
    }

    override fun onHostPause() {
        Log.d(NAME, "onHostPause: Host paused.")
    }

    override fun onHostDestroy() {
        Log.d(NAME, "onHostDestroy: Host destroyed. Unregistering receiver if active.")
        stopBatteryStatusListener()
        reactContext.removeLifecycleEventListener(this)
    }

    private fun getBatteryInfo(intent: Intent? = null): WritableMap {
        val i = intent ?: reactContext.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        val map = Arguments.createMap()

        if (i == null) {
            Log.e(NAME, "getBatteryInfo: Initial battery intent (sticky) was null. Returning default values.")
            map.putDouble("level", 0.0)
            map.putBoolean("isCharging", false)
            return map
        }

        val level = i.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
        val scale = i.getIntExtra(BatteryManager.EXTRA_SCALE, -1)

        val batteryPct = if (scale > 0) ((level.toFloat() / scale.toFloat()) * 100f) else 0f

        val status = i.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
        val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                             status == BatteryManager.BATTERY_STATUS_FULL

        map.putDouble("level", batteryPct.toDouble())
        map.putBoolean("isCharging", isCharging)

        Log.d(NAME, "Battery Info calculated: Level=$batteryPct, Charging=$isCharging, RawStatus=$status, RawLevel=$level, RawScale=$scale")

        return map
    }
}