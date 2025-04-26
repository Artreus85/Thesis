"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { sendVerificationCode, verifyPhoneNumber } from "@/lib/firebase"

interface PhoneVerificationDialogProps {
  userId: string
  phoneNumber: string
  onVerified: () => void
}

export function PhoneVerificationDialog({ userId, phoneNumber, onVerified }: PhoneVerificationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const { toast } = useToast()

  const handleSendCode = async () => {
    setIsSending(true)
    try {
      await sendVerificationCode(userId, phoneNumber)
      setCodeSent(true)
      toast({
        title: "Код изпратен",
        description: `Изпратихме код за потвърждение на ${phoneNumber}`,
      })
    } catch (error) {
      console.error("Error sending verification code:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно изпращане на код. Моля, опитайте отново.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast({
        title: "Въведете код",
        description: "Моля, въведете кода за потвърждение",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    try {
      const success = await verifyPhoneNumber(userId, verificationCode)
      if (success) {
        toast({
          title: "Успешно потвърждение",
          description: "Вашият телефонен номер беше потвърден",
        })
        setIsOpen(false)
        onVerified()
      } else {
        toast({
          title: "Невалиден код",
          description: "Кодът за потвърждение е невалиден. Моля, опитайте отново.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error verifying code:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно потвърждение. Моля, опитайте отново.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Потвърди телефона
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Потвърждение на телефонен номер</DialogTitle>
          <DialogDescription>
            Потвърдете вашия телефонен номер, за да повишите доверието в профила си.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">
            Телефонен номер: <strong>{phoneNumber}</strong>
          </p>

          {!codeSent ? (
            <Button onClick={handleSendCode} disabled={isSending} className="w-full">
              {isSending ? "Изпращане..." : "Изпрати код за потвърждение"}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">
                  Код за потвърждение
                </label>
                <Input
                  id="code"
                  placeholder="Въведете 6-цифрения код"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              <Button onClick={handleVerifyCode} disabled={isVerifying} className="w-full">
                {isVerifying ? "Потвърждаване..." : "Потвърди"}
              </Button>
              <Button variant="ghost" onClick={handleSendCode} disabled={isSending} className="w-full">
                {isSending ? "Изпращане..." : "Изпрати нов код"}
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Затвори
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
