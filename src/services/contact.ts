export type ContactValues = { name: string; email: string; message: string }
export type ContactErrors = Partial<Record<keyof ContactValues, string>>

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {}
  if (!values.name.trim()) errors.name = 'Informe seu nome.'
  if (!values.email.trim()) errors.email = 'Informe seu e-mail.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Informe um e-mail válido.'
  if (!values.message.trim()) errors.message = 'Escreva sua mensagem.'
  return errors
}

// Conecte um envio real aqui e habilite available somente quando estiver funcionando.
// Nunca coloque credenciais privadas neste serviço de frontend.
export const contactService = {
  available: false,
  async send(values: ContactValues): Promise<void> {
    void values
    throw new Error('O envio ainda não está disponível. Sua mensagem não foi enviada.')
  },
}
