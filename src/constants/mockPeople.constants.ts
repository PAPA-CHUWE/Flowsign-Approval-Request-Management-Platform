export interface Person {
  id: string
  name: string
  role: string
  initials: string
}

export const MOCK_PEOPLE: Person[] = [
  { id: "1", name: "James Kamau",    role: "Finance Manager",    initials: "JK" },
  { id: "2", name: "Amina Yusuf",    role: "Department Head",    initials: "AY" },
  { id: "3", name: "David Osei",     role: "CFO",                initials: "DO" },
  { id: "4", name: "Fatou Diallo",   role: "IT Admin",           initials: "FD" },
  { id: "5", name: "Samuel Tunde",   role: "HR Officer",         initials: "ST" },
  { id: "6", name: "Lena Müller",    role: "Operations Lead",    initials: "LM" },
  { id: "7", name: "Kwame Ntiamoah", role: "Finance Controller", initials: "KN" },
]
