export const REQUEST_TYPE = {
  GENERAL: "general",
  ACCESS: "access",
  FINANCE: "finance",
} as const

export const REQUEST_TYPE_LABEL = {
  [REQUEST_TYPE.GENERAL]: "General Request",
  [REQUEST_TYPE.ACCESS]: "Access Request",
  [REQUEST_TYPE.FINANCE]: "Finance Request",
} as const

export type RequestType = (typeof REQUEST_TYPE)[keyof typeof REQUEST_TYPE]
