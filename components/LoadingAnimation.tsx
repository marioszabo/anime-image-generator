import React from 'react'

const LoadingAnimation: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative w-24 h-24">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full border-t-4 border-purple-500 rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-500 font-bold">
          AI
        </div>
      </div>
    </div>
  )
}

export default LoadingAnimation