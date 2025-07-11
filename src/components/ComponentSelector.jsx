import { Cpu, HardDrive, Zap, Monitor, MemoryStick, CircuitBoard, Fan, Box } from 'lucide-react'

function ComponentSelector({ existingComponents, componentModels, onComponentChange, onModelChange }) {
  const components = [
    { key: 'processor', label: 'Processor', icon: Cpu },
    { key: 'motherboard', label: 'Motherboard', icon: CircuitBoard },
    { key: 'memory', label: 'Memory (RAM)', icon: MemoryStick },
    { key: 'gpu', label: 'Graphics Card (GPU)', icon: Monitor },
    { key: 'ssd', label: 'SSD Storage', icon: HardDrive },
    { key: 'hdd', label: 'HDD Storage', icon: HardDrive },
    { key: 'psu', label: 'Power Supply (PSU)', icon: Zap },
    { key: 'casing', label: 'PC Case', icon: Box },
    { key: 'cpuCooler', label: 'CPU Cooler', icon: Fan }
  ]

  return (
    <>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Do you already have any of these components?
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 component-grid">
        {components.map(({ key, label, icon: Icon }) => (
          <div key={key} className="border border-gray-200 rounded-lg p-4 component-card">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id={key}
                checked={existingComponents[key]}
                onChange={(e) => onComponentChange(key, e.target.checked)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Icon className="mr-2 h-5 w-5 text-gray-600" />
              <label htmlFor={key} className="text-sm font-medium text-gray-700">
                {label}
              </label>
            </div>
            
            {existingComponents[key] && (
              <input
                type="text"
                value={componentModels[key]}
                onChange={(e) => onModelChange(key, e.target.value)}
                placeholder={`Enter your ${label.toLowerCase()} model`}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
        ))}
      </div>
    </>
  )
}

export default ComponentSelector
