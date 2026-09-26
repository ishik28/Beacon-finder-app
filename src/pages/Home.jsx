import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bluetooth, BluetoothOff, Scan, Info, X } from 'lucide-react';
import { useBluetooth } from '../hooks/useBluetooth';
import RadarDisplay from '../components/RadarDisplay';
import DeviceCard from '../components/DeviceCard';
import StatusBar from '../components/StatusBar';
import ProximityLabel from '../components/ProximityLabel';
import FindModeSelector from '../components/FindModeSelector';
import EarbudStatus from '../components/EarbudStatus';

export default function Home() {
  const {
    devices,
    isScanning,
    selectedDevice,
    setSelectedDevice,
    error,
    isSimulated,
    scanCount,
    isWebBluetoothSupported,
    startScan,
    startDemo,
    getRssiLevel,
  } = useBluetooth();

  const [showInfo, setShowInfo] = useState(false);
  const [findMode, setFindMode] = useState(null); // null = not chosen yet

  function handleModeSelect(mode) {
    setFindMode(mode);
    setSelectedDevice(null);
    startDemo(mode);
  }

  return (
    <div
      className="min-h-screen flex flex-col font-inter"
      style={{ background: 'linear-gradient(180deg, hsl(222,47%,5%) 0%, hsl(215,40%,8%) 100%)' }}
    >
      <StatusBar isScanning={isScanning} isSimulated={isSimulated} scanCount={scanCount} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3">
        <div>
          <h1 className="font-space font-bold text-xl text-foreground tracking-tight">AirFinder</h1>
          <p className="text-xs text-muted-foreground">BLE Device Locator</p>
        </div>
        <div className="flex items-center gap-2">
          {findMode && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setFindMode(null); }}
              className="text-xs font-space px-3 py-1.5 rounded-full bg-muted/40 border border-border/40 text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </motion.button>
          )}
          <button
            onClick={() => setShowInfo(v => !v)}
            className="w-9 h-9 rounded-full bg-muted/40 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {showInfo ? <X className="w-4 h-4" /> : <Info className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-5 mb-3 overflow-hidden"
          >
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-sm text-muted-foreground space-y-1.5">
              <p className="text-primary font-medium font-space">How it works</p>
              <p>• Choose what you're looking for below.</p>
              <p>• On Android Chrome, tap <strong className="text-foreground">Scan</strong> to use real Bluetooth.</p>
              <p>• On iOS Safari, use <strong className="text-foreground">Demo</strong> mode (real BLE not supported).</p>
              <p>• RSSI determines proximity — <strong className="text-orange-400">HOT</strong> = very close · <strong className="text-yellow-400">WARM</strong> = close · <strong className="text-cyan-400">COOL</strong> = nearby · <strong className="text-blue-400">COLD</strong> = far</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center px-5 gap-5 pb-8">

        {/* ── MODE NOT SELECTED ── */}
        <AnimatePresence mode="wait">
          {!findMode ? (
            <motion.div
              key="mode-select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-5 pt-2"
            >
              <div className="text-center pb-2">
                <div className="text-5xl mb-3">📡</div>
                <h2 className="font-space font-bold text-lg text-foreground">Find Your Device</h2>
                <p className="text-sm text-muted-foreground mt-1">Select what you want to locate</p>
              </div>

              <FindModeSelector selectedMode={findMode} onSelect={handleModeSelect} />

              {/* Manual BLE scan option */}
              {isWebBluetoothSupported && (
                <div className="pt-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-px bg-border/40" />
                    <span className="text-xs text-muted-foreground/50 font-space">or</span>
                    <div className="flex-1 h-px bg-border/40" />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { setFindMode('all'); startScan(); }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-space font-semibold text-sm bg-primary text-primary-foreground"
                    style={{ boxShadow: '0 0 24px rgba(34,211,238,0.3)' }}
                  >
                    <Bluetooth className="w-4 h-4" />
                    Real BLE Scan (Android Chrome)
                  </motion.button>
                </div>
              )}
            </motion.div>

          ) : (
            /* ── MODE SELECTED ── */
            <motion.div
              key="scanner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center gap-5"
            >
              {/* Mode badge */}
              <div className="flex items-center gap-2 self-start">
                <span className="text-lg">
                  {findMode === 'earbuds' ? '🎧' : findMode === 'case' ? '📦' : '🔍'}
                </span>
                <div>
                  <p className="font-space font-semibold text-sm text-foreground">
                    {findMode === 'earbuds' ? 'Finding Earbuds' : findMode === 'case' ? 'Finding Case' : 'Scanning All'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {findMode === 'earbuds' ? 'Move around to locate L/R earbuds' : findMode === 'case' ? 'Find your charging case' : 'All nearby BLE devices'}
                  </p>
                </div>
              </div>

              {/* Radar */}
              <RadarDisplay device={selectedDevice} isScanning={isScanning} />

              <div className="min-h-[56px] flex flex-col items-center justify-center">
                {selectedDevice ? (
                  <ProximityLabel device={selectedDevice} />
                ) : isScanning ? (
                  <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="text-sm text-muted-foreground"
                  >
                    Scanning for devices...
                  </motion.p>
                ) : (
                  <p className="text-sm text-muted-foreground">Tap a device below to track it</p>
                )}
              </div>

              {/* L/R Earbud status */}
              <EarbudStatus devices={devices} findMode={findMode} />

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full bg-destructive/10 border border-destructive/30 rounded-2xl px-4 py-3 text-sm text-destructive flex items-start gap-2"
                  >
                    <BluetoothOff className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scan controls */}
              <div className="flex gap-3 w-full">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => isScanning ? null : startDemo(findMode)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-space font-semibold text-sm transition-all duration-300 ${
                    isScanning
                      ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                      : 'bg-primary text-primary-foreground'
                  }`}
                  style={!isScanning ? { boxShadow: '0 0 24px rgba(34,211,238,0.35)' } : {}}
                >
                  {isScanning ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                        <Scan className="w-4 h-4" />
                      </motion.div>
                      Scanning…
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4" />
                      Re-scan
                    </>
                  )}
                </motion.button>

                {isWebBluetoothSupported && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setFindMode('all'); startScan(); }}
                    className="px-4 py-3.5 rounded-2xl font-space font-semibold text-sm bg-muted/40 border border-border/50 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <Bluetooth className="w-4 h-4" />
                    BLE
                  </motion.button>
                )}
              </div>

              {/* Device list */}
              <AnimatePresence>
                {devices.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground font-space tracking-wider uppercase">Detected Devices</p>
                      <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">{devices.length}</span>
                    </div>
                    {devices.map(device => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        isSelected={selectedDevice?.id === device.id}
                        onSelect={d => setSelectedDevice(prev => prev?.id === d.id ? null : d)}
                        getRssiLevel={getRssiLevel}
                      />
                    ))}
                    <p className="text-xs text-center text-muted-foreground/50 pt-1">Tap a device to track it on the radar</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
