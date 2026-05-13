export const REQUEST_TYPE = {
  GENERAL: "general",
  ACCESS: "access",
  FINANCE: "finance",
  ASSET: "asset",
  TRAVEL: "travel",
  HR: "hr",
} as const

export const REQUEST_TYPE_LABEL = {
  [REQUEST_TYPE.GENERAL]: "General Request",
  [REQUEST_TYPE.ACCESS]: "Access Request",
  [REQUEST_TYPE.FINANCE]: "Finance Request",
  [REQUEST_TYPE.ASSET]: "Asset Request",
  [REQUEST_TYPE.TRAVEL]: "Travel Request",
  [REQUEST_TYPE.HR]: "HR Request",
} as const

export type RequestType = (typeof REQUEST_TYPE)[keyof typeof REQUEST_TYPE]
