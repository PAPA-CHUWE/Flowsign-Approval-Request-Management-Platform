import { REQUEST_TYPE } from "@/constants/requestType.constants"
import { TICKET_STATUS } from "@/constants/ticketStatus.constants"
import type { Ticket } from "@/types/ticket.types"
import type { Priority } from "@/components/tickets/PriorityBadge"

export type MockTicket = Ticket & {
  priority: Priority
  assignee: string
  releasedBy: string
  completionDate?: string
}

export const MOCK_TICKETS: MockTicket[] = [
  { id: "ticket_001", reference: "FSG000089", title: "Laptop procurement for new hires",          requesterName: "Amina Yusuf",    requestType: REQUEST_TYPE.ASSET,   status: TICKET_STATUS.APPROVED,  submittedAt: "2026-05-21T10:00:00Z", priority: "P2", assignee: "James Kamau",    releasedBy: "David Osei",    completionDate: "2026-05-21" },
  { id: "ticket_002", reference: "FSG000088", title: "Travel to Nairobi — Q2 partnership",        requesterName: "David Osei",     requestType: REQUEST_TYPE.TRAVEL,  status: TICKET_STATUS.IN_REVIEW, submittedAt: "2026-05-18T09:00:00Z", priority: "P1", assignee: "Fatou Diallo",   releasedBy: "James Kamau",   completionDate: "2026-05-22" },
  { id: "ticket_003", reference: "FSG000087", title: "CRM system access — sales team",            requesterName: "Fatou Diallo",   requestType: REQUEST_TYPE.ACCESS,  status: TICKET_STATUS.PENDING,   submittedAt: "2026-05-14T14:30:00Z", priority: "P3", assignee: "Samuel Tunde",   releasedBy: "Amina Yusuf",   completionDate: "2026-05-16" },
  { id: "ticket_004", reference: "FSG000086", title: "Q3 marketing budget top-up request",        requesterName: "Samuel Tunde",   requestType: REQUEST_TYPE.FINANCE, status: TICKET_STATUS.APPROVED,  submittedAt: "2026-05-17T11:00:00Z", priority: "P2", assignee: "Lena Müller",    releasedBy: "Fatou Diallo",  completionDate: "2026-05-18" },
  { id: "ticket_005", reference: "FSG000085", title: "Annual leave — 7 working days",             requesterName: "Lena Müller",    requestType: REQUEST_TYPE.HR,      status: TICKET_STATUS.APPROVED,  submittedAt: "2026-05-12T08:00:00Z", priority: "P1", assignee: "Kwame Ntiamoah", releasedBy: "Samuel Tunde",  completionDate: "2026-05-13" },
  { id: "ticket_006", reference: "FSG000084", title: "Office supplies — Q2 restock",              requesterName: "Kwame Ntiamoah", requestType: REQUEST_TYPE.FINANCE, status: TICKET_STATUS.APPROVED,  submittedAt: "2026-05-11T13:00:00Z", priority: "P3", assignee: "Amina Yusuf",    releasedBy: "Lena Müller",   completionDate: "2026-05-11" },
  { id: "ticket_007", reference: "FSG000083", title: "Overtime approval — product launch sprint", requesterName: "James Kamau",    requestType: REQUEST_TYPE.HR,      status: TICKET_STATUS.REJECTED,  submittedAt: "2026-05-12T16:00:00Z", priority: "P2", assignee: "David Osei",     releasedBy: "Kwame Ntiamoah", completionDate: "2026-05-13" },
  { id: "ticket_008", reference: "FSG000082", title: "AWS production environment access",         requesterName: "Amina Yusuf",    requestType: REQUEST_TYPE.ACCESS,  status: TICKET_STATUS.OPEN,      submittedAt: "2026-05-10T10:00:00Z", priority: "P2", assignee: "Fatou Diallo",   releasedBy: "James Kamau" },
  { id: "ticket_009", reference: "FSG000081", title: "Vendor payment — Acme Corp invoice",        requesterName: "David Osei",     requestType: REQUEST_TYPE.FINANCE, status: TICKET_STATUS.REJECTED,  submittedAt: "2026-05-10T09:00:00Z", priority: "P2", assignee: "Samuel Tunde",   releasedBy: "Amina Yusuf",   completionDate: "2026-05-11" },
  { id: "ticket_010", reference: "FSG000080", title: "Ergonomic chair request — remote worker",   requesterName: "Fatou Diallo",   requestType: REQUEST_TYPE.ASSET,   status: TICKET_STATUS.IN_REVIEW, submittedAt: "2026-05-09T14:00:00Z", priority: "P1", assignee: "Lena Müller",    releasedBy: "David Osei" },
  { id: "ticket_011", reference: "FSG000079", title: "Conference attendance — FinTech Summit",    requesterName: "Samuel Tunde",   requestType: REQUEST_TYPE.TRAVEL,  status: TICKET_STATUS.IN_REVIEW, submittedAt: "2026-05-08T11:00:00Z", priority: "P3", assignee: "Kwame Ntiamoah", releasedBy: "Fatou Diallo" },
  { id: "ticket_012", reference: "FSG000078", title: "Salary advance — medical emergency",        requesterName: "Lena Müller",    requestType: REQUEST_TYPE.FINANCE, status: TICKET_STATUS.OPEN,      submittedAt: "2026-05-08T09:00:00Z", priority: "P2", assignee: "Amina Yusuf",    releasedBy: "Samuel Tunde" },
  { id: "ticket_013", reference: "FSG000077", title: "Training budget — data engineering cert",   requesterName: "Kwame Ntiamoah", requestType: REQUEST_TYPE.FINANCE, status: TICKET_STATUS.APPROVED,  submittedAt: "2026-05-07T10:00:00Z", priority: "P1", assignee: "James Kamau",    releasedBy: "Lena Müller",   completionDate: "2026-05-07" },
  { id: "ticket_014", reference: "FSG000076", title: "Printer replacement — main office floor",   requesterName: "James Kamau",    requestType: REQUEST_TYPE.ASSET,   status: TICKET_STATUS.APPROVED,  submittedAt: "2026-05-04T08:00:00Z", priority: "P2", assignee: "David Osei",     releasedBy: "Kwame Ntiamoah", completionDate: "2026-05-07" },
]
