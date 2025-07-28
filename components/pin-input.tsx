"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PinInputProps {
  length?: number
  onComplete: (pin: string) => void
  onPinChange?: (pin: string) => void
  disabled?: boolean
  className?: string
}

export function PinInput({ length = 6, onComplete, onPinChange, disabled = false, className }: PinInputProps) {
  const [pin, setPin] = useState<string[]>(new Array(length).fill(""))
  const [isCompleting, setIsCompleting] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const pinString = pin.join("")
    onPinChange?.(pinString)

    if (pinString.length === length && !isCompleting && !disabled) {
      setIsCompleting(true)
      onComplete(pinString)
      // Reset completing state after a short delay
      setTimeout(() => setIsCompleting(false), 1000)
    }
  }, [pin, length, onComplete, onPinChange, isCompleting, disabled])

  // Reset pin when component is re-mounted or disabled changes
  useEffect(() => {
    if (disabled) {
      setPin(new Array(length).fill(""))
      setIsCompleting(false)
    }
  }, [disabled, length])

  const handleChange = (index: number, value: string) => {
    if (disabled || isCompleting) return

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    // Move to next input if value is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (disabled || isCompleting) return

    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled || isCompleting) return

    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain")
    const pastedPin = pastedData.replace(/\D/g, "").slice(0, length)

    const newPin = new Array(length).fill("")
    for (let i = 0; i < pastedPin.length; i++) {
      newPin[i] = pastedPin[i]
    }
    setPin(newPin)

    // Focus the next empty input or the last input
    const nextEmptyIndex = newPin.findIndex((digit) => digit === "")
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {pin.map((digit, index) => (
      <Input
        key={index}
        ref={(el) => {
          inputRefs.current[index] = el
        }}
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={digit}
        onChange={(e) => handleChange(index, e.target.value)}
        onKeyDown={(e) => handleKeyDown(index, e)}
        onPaste={handlePaste}
        disabled={disabled || isCompleting}
        className={cn("w-12 h-12 text-center text-lg font-semibold", isCompleting && "opacity-50")}
      />
      ))}
    </div>
  )
}
