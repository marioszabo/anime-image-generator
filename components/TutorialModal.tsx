import React from 'react'
import { X, Wand2, PenTool, Image, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const steps = [
    {
      icon: <PenTool className="h-6 w-6 text-purple-500" />,
      title: "Craft Your Prompt",
      description: "Choose a template or write your own creative prompt. Be specific for best results!"
    },
    {
      icon: <Wand2 className="h-6 w-6 text-blue-500" />,
      title: "Generate Art",
      description: "Click 'Generate' and watch as AI transforms your words into anime art."
    },
    {
      icon: <Image className="h-6 w-6 text-green-500" />,
      title: "Explore Results",
      description: "Your anime artwork will appear below. Not quite right? Try tweaking your prompt and generate again."
    },
    {
      icon: <Download className="h-6 w-6 text-red-500" />,
      title: "Save Your Creation",
      description: "Love what you see? Download your image or save it to your gallery."
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl mx-auto overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Anime Art Generator Guide</CardTitle>
            <Button variant="ghost" onClick={onClose} className="text-white hover:text-gray-200">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-gray-100 rounded-full p-3">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-gray-600 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h4 className="font-semibold text-blue-700">Pro Tips:</h4>
            <ul className="list-disc list-inside mt-2 text-blue-600 space-y-1">
              <li>Use descriptive adjectives for more detailed results</li>
              <li>Experiment with different art styles in your prompts</li>
              <li>Combine unexpected elements for unique creations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TutorialModal
