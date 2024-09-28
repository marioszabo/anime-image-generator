import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Maximize2 } from "lucide-react"

interface ImageDialogProps {
  imageUrl: string
  prompt: string
}

export default function ImageDialog({ imageUrl, prompt }: ImageDialogProps = { imageUrl: '', prompt: '' }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <div className="relative aspect-square">
          <Image
            src={imageUrl}
            alt="Full size image"
            layout="fill"
            objectFit="contain"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">Prompt: {prompt}</p>
      </DialogContent>
    </Dialog>
  )
}