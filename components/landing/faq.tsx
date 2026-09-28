import { SectionHeading } from "@/components/landing/section-heading"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQS = [
  {
    question: "How is the storage cost calculated?",
    answer:
      "Cost = quantity (kg) × the warehouse's rate per kg per day × billable days. Billable days are the days actually stored, but never less than the warehouse's minimum booking period.",
  },
  {
    question: "What happens if I withdraw early or stay longer?",
    answer:
      "Withdrawing early still pays the minimum-days floor. If you stay past your booked end date, the extra days are charged at 1.5× the normal rate.",
  },
  {
    question: "When do I pay?",
    answer:
      "After the warehouse owner approves your booking request. You pay online through Stripe, and the booking is confirmed only once the payment is verified.",
  },
  {
    question: "Can I cancel a booking?",
    answer:
      "Yes. You can cancel while the booking is waiting for approval or approved but not yet paid. Paid bookings are handled through the platform's refund process.",
  },
  {
    question: "What is the quality inspection?",
    answer:
      "When your produce arrives, it is inspected and graded A, B or C with the actual weight recorded. Produce graded REJECTED cannot be stored and the booking is cancelled.",
  },
  {
    question: "How do I list my warehouse?",
    answer:
      "Sign up as a warehouse owner, complete your business profile with your trade license and NID, then add your warehouse and chambers. It goes live once an admin approves it.",
  },
]

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t bg-muted/40 py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:px-8">
        <SectionHeading
          align="left"
          eyebrow="FAQ"
          title="Questions, answered"
          description="Everything you need to know about booking, paying and storing with AgroStore."
        />
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-base">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
