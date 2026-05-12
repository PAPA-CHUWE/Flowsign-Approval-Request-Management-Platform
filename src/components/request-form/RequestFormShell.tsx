"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  REQUEST_TYPE,
  REQUEST_TYPE_LABEL,
  type RequestType,
} from "@/constants/requestType.constants"
import { useCreateRequest } from "@/hooks/requests/useCreateRequest"
import { AccessRequestFields } from "./fields/AccessRequestFields"
import { FinanceRequestFields } from "./fields/FinanceRequestFields"
import { GeneralRequestFields } from "./fields/GeneralRequestFields"
import { RequesterDetailsStep } from "./steps/RequesterDetailsStep"

const requestTypes = Object.values(REQUEST_TYPE)

export function RequestFormShell() {
  const [type, setType] = useState<RequestType>(REQUEST_TYPE.GENERAL)
  const { isSubmitting } = useCreateRequest()

  return (
    <form className="grid max-w-xl gap-4">
      <div className="flex flex-wrap gap-2">
        {requestTypes.map((requestType) => (
          <Button
            key={requestType}
            type="button"
            variant={type === requestType ? "default" : "outline"}
            onClick={() => setType(requestType)}
          >
            {REQUEST_TYPE_LABEL[requestType]}
          </Button>
        ))}
      </div>
      <RequesterDetailsStep disabled={isSubmitting} />
      <Input disabled={isSubmitting} name="summary" placeholder="Summary" />
      {type === REQUEST_TYPE.ACCESS && (
        <AccessRequestFields disabled={isSubmitting} />
      )}
      {type === REQUEST_TYPE.FINANCE && (
        <FinanceRequestFields disabled={isSubmitting} />
      )}
      {type === REQUEST_TYPE.GENERAL && (
        <GeneralRequestFields disabled={isSubmitting} />
      )}
      <Button className="w-fit" disabled={isSubmitting} type="submit">
        Submit request
      </Button>
    </form>
  )
}
