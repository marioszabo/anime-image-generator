import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export const Select: React.FC<SelectProps> = ({ options, value, onValueChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value ? options.find(option => option.value === value)?.label : placeholder || 'Select an option'}
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2" />
      </button>
      {isOpen && (
        <ul className="absolute z-10 w-full py-1 mt-1 overflow-auto bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none">
          {options.map((option) => (
            <li
              key={option.value}
              className="px-4 py-2 text-sm text-gray-900 cursor-pointer hover:bg-indigo-500 hover:text-white"
              onClick={() => {
                onValueChange(option.value)
                setIsOpen(false)
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export const SelectTrigger: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <>{children}</>
}

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  return <span>{placeholder}</span>
}

export const SelectContent: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <>{children}</>
}

export const SelectItem: React.FC<{ value: string } & React.PropsWithChildren> = ({ value, children }) => {
  return <>{children}</>
}