export interface WebFinger {
  subject: string
  links: Link[]
}

export interface Link {
  rel: string
  type: string
  href: string
}
