'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { ImageIcon, RefreshCw, HelpCircle, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
// import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Select } from "@/components/ui/select"
import TutorialModal from "@/components/TutorialModal"
import LoadingAnimation from "@/components/LoadingAnimation"
import { motion, AnimatePresence } from "framer-motion"

// Define prompt templates for users to choose from
const promptTemplates = [
  { value: "anime_character", label: "Anime Character", prompt: "Create an anime character with [hair color] hair and [eye color] eyes, wearing [clothing style]" },
  { value: "anime_landscape", label: "Anime Landscape", prompt: "Design an anime-style landscape featuring [location] with [weather condition]" },
  { value: "anime_action", label: "Anime Action Scene", prompt: "Illustrate an action-packed anime scene with [character description] fighting [opponent description]" },
  { value: "anime_emotion", label: "Emotional Anime Moment", prompt: "Depict an emotional anime scene where [character description] is feeling [emotion]" },
  { value: "anime_food", label: "Anime Food", prompt: "Draw a mouth-watering anime-style [dish name] with [description of presentation]" },
]

export default function Home() {
  // State variables for managing the application's state
  const [prediction, setPrediction] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [prompt, setPrompt] = useState("")
  // const [enhancePrompt, setEnhancePrompt] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [generatedImages, setGeneratedImages] = useState<Array<{ url: string, prompt: string }>>([])
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)

  // Load saved images from local storage on component mount
  useEffect(() => {
    const savedImages = localStorage.getItem('generatedImages')
    if (savedImages) {
      setGeneratedImages(JSON.parse(savedImages))
    }
  }, [])

  // Save generated images to local storage whenever the array changes
  useEffect(() => {
    localStorage.setItem('generatedImages', JSON.stringify(generatedImages))
  }, [generatedImages])

  // Handle template selection and update the prompt
  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value)
    const template = promptTemplates.find(t => t.value === value)
    if (template) {
      setPrompt(template.prompt)
    }
  }

  // Handle form submission to generate an image
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setPrediction(null)

    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      const result = await response.json();

      if (response.status === 202) {
        // The request is processing
        toast({
          title: "Processing",
          description: "The image is being generated. Please wait...",
        });
        
        let attempts = 0;
        const maxAttempts = 60; // Stop after 1 minute (30 * 2 seconds)

        const pollInterval = setInterval(async () => {
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setError("Image generation timed out. Please try again.");
            setIsLoading(false);
            return;
          }

          attempts++;
          const statusResponse = await fetch(`/api/predictions?requestId=${result.requestId}`);
          const statusResult = await statusResponse.json();

          if (statusResult.status === 'completed') {
            clearInterval(pollInterval);
            setPrediction(statusResult);
            setGeneratedImages(prev => [{ url: statusResult.output[0], prompt }, ...prev]);
            toast({
              title: "Success",
              description: "Your image has been generated!",
            });
            setIsLoading(false);
          } else if (statusResult.status === 'error') {
            clearInterval(pollInterval);
            throw new Error(statusResult.detail);
          }
        }, 2000); // Poll every 2 seconds
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err.message || "An unexpected error occurred");
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }

  // Handle image download
  const handleDownload = (url: string, prompt: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `anime-art-${prompt.slice(0, 20)}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Reset form fields and state
  const handleReset = () => {
    setPrompt("")
    // setEnhancePrompt(false)
    setPrediction(null)
    setError(null)
    setSelectedTemplate("")
  }

  // Remove a generated image from the list
  const handleDeleteImage = (index: number) => {
    setGeneratedImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
        {/* Header with title and help button */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-6"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
            Create your own{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Anime Art
            </span>
          </h1>
          <Button variant="ghost" onClick={() => setIsTutorialOpen(true)}>
            <HelpCircle className="h-6 w-6 text-white" />
          </Button>
        </motion.div>

        {/* Image generation form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mb-8 bg-white/10 backdrop-blur-md border-none">
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-6">
                {/* Prompt template selection */}
                <div className="space-y-2">
                  <Label htmlFor="promptTemplate" className="text-white">Prompt Template</Label>
                  <Select
                    options={promptTemplates}
                    value={selectedTemplate}
                    onValueChange={handleTemplateChange}
                    placeholder="Select a prompt template"
                  />
                </div>
                {/* Prompt input field */}
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-white">Prompt</Label>
                  <Input
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter a prompt to generate an image, or customize the template above"
                    required
                    className="bg-white/20 text-white placeholder-gray-400"
                  />
                </div>
                {/* Enhance prompt switch (commented out) */}
                {/* <div className="flex items-center space-x-2">
                  <Switch
                    id="enhancePrompt"
                    checked={enhancePrompt}
                    onCheckedChange={setEnhancePrompt}
                  />
                  <Label htmlFor="enhancePrompt" className="text-white">Enhance Prompt</Label>
                </div> */}
              </CardContent>
              <CardFooter className="flex justify-between">
                {/* Reset button */}
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                {/* Generate button */}
                <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  {isLoading ? (
                    <>
                      Generating...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="mb-8 border-destructive bg-destructive/10">
              <CardContent className="pt-6">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Generated images display */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Generated Images</h2>
          {isLoading ? (
            <Card className="overflow-hidden bg-white/10 backdrop-blur-md border-none">
              <CardContent className="p-0">
                <LoadingAnimation />
              </CardContent>
            </Card>
          ) : generatedImages.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
            >
              <AnimatePresence>
                {generatedImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden bg-white/10 backdrop-blur-md border-none">
                      <CardContent className="p-4">
                        {/* Display generated image */}
                        <div className="relative aspect-square mb-4">
                          <Image
                            src={image.url}
                            alt={`Generated image ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-lg"
                          />
                        </div>
                        {/* Display prompt used for generation */}
                        <p className="text-sm text-gray-300 mb-2">Prompt: {image.prompt}</p>
                        <div className="flex justify-between">
                          {/* Download button */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownload(image.url, image.prompt)}
                            className="w-1/2 mr-2"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          {/* Delete button */}
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteImage(index)}
                            className="w-1/2 ml-2"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <p className="text-white text-center">No images generated yet. Start by entering a prompt and clicking "Generate"!</p>
          )}
        </div>

        {/* Tutorial modal */}
        <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
      </div>
    </div>
  )
}