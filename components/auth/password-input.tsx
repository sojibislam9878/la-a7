"use client"

import { useState } from "react"
import { EyeIcon, EyeOffIcon, LockKeyholeIcon } from "lucide-react"

import { AuthInput } from "@/components/auth/auth-input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PasswordInput({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <AuthInput
        icon={LockKeyholeIcon}
        type={visible ? "text" : "password"}
        className={cn("pr-11", className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-lg text-muted-foreground"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        aria-controls={props.id}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
    </div>
  )
}
