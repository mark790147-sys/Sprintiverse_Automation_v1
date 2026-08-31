# Sprintiverse — DPDP Processor Register

The application currently identifies these processor categories in the database table `vendor_processors`:

| Processor | Service | Recipient country | Current DPA status |
|---|---|---|---|
| Supabase | Database & Authentication | United States | Review / execute required |
| Vercel | Hosting & CDN | United States | Review / execute required |
| Google | OAuth authentication | United States | Review applicable terms |
| Razorpay | Payments | India | Review / execute required |

The processor inventory is exposed to users in **Privacy & Data Rights**. The service operator must verify and update DPA status before production launch, review sub-processors periodically, and ensure only necessary data is shared with each vendor.

This register deliberately does not claim that a DPA has been executed when the repository does not contain evidence of execution.
