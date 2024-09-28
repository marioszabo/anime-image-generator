import React from 'react'
import { X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>How to Use Anime Art Generator</CardTitle>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Choose a prompt template or write your own prompt in the input field.</li>
            <li>If using a template, replace the placeholders (e.g., [hair color]) with your desired details.</li>
            <li>Toggle "Enhance Prompt" if you want the AI to expand on your prompt (optional).</li>
            <li>Click "Generate" to create your anime art.</li>
            <li>Wait for the image to be generated and displayed.</li>
            <li>Use the "Reset" button to start over with a new prompt.</li>
          </ol>
          <p className="mt-4">
            Tips:
            <ul className="list-disc list-inside mt-2">
              <li>Be specific in your descriptions for better results.</li>
              <li>Experiment with different prompt styles to see what works best.</li>
              <li>If you're not satisfied with the result, try regenerating or adjusting your prompt.</li>
            </ul>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default TutorialModal
