# Revenue Projections & Business Model

## **Pricing Tiers**

### Tier 1: Starter ($99/month)
**Target:** Solo entrepreneurs, small businesses (< $50K annual revenue)

**Included:**
- 1 business vertical
- Up to 3 active workflows
- 500 workflow executions/month
- Email support
- Basic analytics
- 1 user seat

**Target Customers:**
- Dropshipping stores (< 100 orders/month)
- Freelance coaches
- Small e-commerce brands
- Solopreneurs

**Conversion Rate:** 12% (freemium to paid)

---

### Tier 2: Professional ($299/month)
**Target:** Growing businesses ($50K-$500K annual revenue)

**Included:**
- Up to 3 business verticals
- Unlimited workflows
- 2,500 executions/month
- Priority email + chat support
- Advanced analytics + A/B testing
- 5 user seats
- Custom integrations (API access)

**Target Customers:**
- Real estate teams (5-10 agents)
- Auto dealerships (single location)
- Trade services (plumbing, HVAC)
- Digital product creators

**Conversion Rate:** 8% (free trial to paid)

---

### Tier 3: Enterprise ($999/month)
**Target:** Established businesses ($500K+ annual revenue)

**Included:**
- All business verticals
- Unlimited everything
- Dedicated account manager
- Custom workflow development (2 hours/month)
- White-label options
- Advanced security (SSO, SAML)
- Unlimited user seats
- 99.9% SLA

**Target Customers:**
- Multi-location dealerships
- Large real estate brokerages
- SaaS companies (> $1M ARR)
- Enterprise e-commerce brands

**Conversion Rate:** 3% (enterprise sales cycle)

---

## **Revenue Projections**

### Year 1: Foundation (Months 1-12)

#### Q1 (Months 1-3): Beta Launch
- **Month 1:** 10 beta users (free) → $0 MRR
- **Month 2:** 25 users (10 paid Starter) → $990 MRR
- **Month 3:** 50 users (30 paid: 25 Starter, 5 Professional) → $3,975 MRR

**Q1 Total MRR:** $3,975  
**Q1 ARR Run Rate:** $47,700

#### Q2 (Months 4-6): Growth
- **Month 4:** 80 users (50 paid: 40 Starter, 8 Pro, 2 Enterprise) → $8,358 MRR
- **Month 5:** 120 users (80 paid: 60 Starter, 15 Pro, 5 Enterprise) → $15,425 MRR
- **Month 6:** 180 users (130 paid: 90 Starter, 30 Pro, 10 Enterprise) → $27,870 MRR

**Q2 Total MRR:** $27,870  
**Q2 ARR Run Rate:** $334,440

#### Q3 (Months 7-9): Scale
- **Month 7:** 250 users (180 paid: 120 Starter, 45 Pro, 15 Enterprise) → $39,330 MRR
- **Month 8:** 350 users (260 paid: 170 Starter, 65 Pro, 25 Enterprise) → $58,285 MRR
- **Month 9:** 480 users (360 paid: 230 Starter, 90 Pro, 40 Enterprise) → $89,650 MRR

**Q3 Total MRR:** $89,650  
**Q3 ARR Run Rate:** $1,075,800

#### Q4 (Months 10-12): Profitability
- **Month 10:** 620 users (480 paid: 300 Starter, 120 Pro, 60 Enterprise) → $125,880 MRR
- **Month 11:** 780 users (620 paid: 380 Starter, 160 Pro, 80 Enterprise) → $165,620 MRR
- **Month 12:** 1,000 users (800 paid: 480 Starter, 210 Pro, 110 Enterprise) → $215,670 MRR

**Q4 Total MRR:** $215,670  
**Year 1 Ending ARR:** $2,588,040

---

### Year 2: Expansion (Months 13-24)

#### Growth Assumptions
- **Monthly Growth Rate:** 15% (down from 30% Year 1)
- **Churn Rate:** 3% (improving from 5% Year 1)
- **Tier Migration:** 10% of Starter → Pro, 5% Pro → Enterprise

#### Q1 Year 2
- **Month 13:** $248,020 MRR
- **Month 14:** $285,220 MRR
- **Month 15:** $328,000 MRR

#### Q2 Year 2
- **Month 16:** $377,200 MRR
- **Month 17:** $433,780 MRR
- **Month 18:** $498,850 MRR

#### Q3 Year 2
- **Month 19:** $573,680 MRR
- **Month 20:** $659,730 MRR
- **Month 21:** $758,690 MRR

#### Q4 Year 2
- **Month 22:** $872,500 MRR
- **Month 23:** $1,003,375 MRR
- **Month 24:** $1,153,880 MRR

**Year 2 Ending ARR:** $13,846,560

---

### Year 3: Market Leadership

#### Growth Assumptions
- **Monthly Growth Rate:** 10% (mature market)
- **Churn Rate:** 2% (product-market fit achieved)
- **Enterprise Focus:** 25% of revenue from Enterprise tier

**Year 3 Ending ARR:** $35,000,000+

---

## **Unit Economics**

### Customer Acquisition Cost (CAC)

#### Organic Channels (60% of customers)
- **Content Marketing:** $150 per customer
- **SEO:** $100 per customer
- **Referrals:** $50 per customer
- **Blended Organic CAC:** $100

#### Paid Channels (40% of customers)
- **Google Ads:** $500 per customer
- **Facebook/Instagram Ads:** $350 per customer
- **LinkedIn Ads:** $800 per customer (Enterprise)
- **Blended Paid CAC:** $550

**Overall Blended CAC:** $280

### Lifetime Value (LTV)

#### Starter Tier
- **Monthly Revenue:** $99
- **Avg Customer Lifespan:** 18 months
- **LTV:** $1,782
- **LTV:CAC Ratio:** 6.4:1 ✅

#### Professional Tier
- **Monthly Revenue:** $299
- **Avg Customer Lifespan:** 24 months
- **LTV:** $7,176
- **LTV:CAC Ratio:** 25.6:1 ✅✅

#### Enterprise Tier
- **Monthly Revenue:** $999
- **Avg Customer Lifespan:** 36 months
- **LTV:** $35,964
- **LTV:CAC Ratio:** 128.4:1 ✅✅✅

**Target LTV:CAC Ratio:** 3:1 minimum (achieved: 6.4:1 average)

---

## **Cost Structure**

### Variable Costs (Per Customer)

#### Infrastructure (GCP)
- **Starter:** $8/month (Firestore, Functions, minimal compute)
- **Professional:** $25/month (higher API usage, workflows)
- **Enterprise:** $80/month (dedicated resources, SLA compliance)

#### Third-Party APIs
- **Klaviyo:** $5/month per customer (email automation)
- **Twilio:** $2/month per customer (SMS, light usage)
- **Integrations:** $3/month per customer (Shopify, Stripe webhooks)

**Total Variable Cost:**
- Starter: $18/month → **Gross Margin: 82%**
- Professional: $35/month → **Gross Margin: 88%**
- Enterprise: $90/month → **Gross Margin: 91%**

### Fixed Costs (Monthly)

#### Year 1
- **Engineering (2 FTE):** $30,000/month
- **Customer Success (1 FTE):** $8,000/month
- **Sales (1 FTE):** $10,000/month
- **Marketing:** $15,000/month (ads, content, tools)
- **Infrastructure (base):** $2,000/month (GCP core services)
- **Software/Tools:** $2,000/month (Figma, analytics, etc.)
- **Legal/Accounting:** $3,000/month

**Total Fixed Costs Year 1:** $70,000/month

#### Year 2
- **Engineering (4 FTE):** $60,000/month
- **Customer Success (3 FTE):** $24,000/month
- **Sales (3 FTE):** $30,000/month
- **Marketing:** $50,000/month
- **Infrastructure:** $10,000/month
- **Software/Tools:** $5,000/month
- **Legal/Accounting:** $5,000/month

**Total Fixed Costs Year 2:** $184,000/month

---

## **Profitability Timeline**

### Month-by-Month Profitability

| Month | MRR | Variable Costs | Fixed Costs | Net Profit | Cumulative |
|-------|-----|---------------|-------------|------------|------------|
| 1 | $0 | $0 | $70K | -$70K | -$70K |
| 2 | $990 | $180 | $70K | -$69K | -$139K |
| 3 | $3,975 | $630 | $70K | -$66K | -$205K |
| 4 | $8,358 | $1,440 | $70K | -$63K | -$268K |
| 5 | $15,425 | $2,800 | $70K | -$57K | -$325K |
| 6 | $27,870 | $5,100 | $70K | -$47K | -$372K |
| 7 | $39,330 | $7,560 | $70K | -$38K | -$410K |
| 8 | $58,285 | $11,200 | $70K | -$23K | -$433K |
| 9 | $89,650 | $17,100 | $70K | **+$2.5K** | **-$430K** ✅ |
| 10 | $125,880 | $24,000 | $70K | +$31.8K | -$398K |
| 11 | $165,620 | $32,500 | $70K | +$63.1K | -$335K |
| 12 | $215,670 | $43,200 | $70K | +$102.4K | **-$232K** |

**First Profitable Month:** Month 9  
**Payback Period (Break-even):** Month 14 (Year 2)

---

## **Exit Scenarios**

### Scenario 1: Strategic Acquisition (Year 2)
- **ARR:** $13.8M
- **Valuation Multiple:** 8x ARR (SaaS standard)
- **Exit Value:** $110M
- **Founder Equity (70%):** $77M

### Scenario 2: Growth Equity (Year 3)
- **ARR:** $35M
- **Valuation Multiple:** 10x ARR (fast growth)
- **Raise Amount:** $100M (Series B)
- **Post-Money Valuation:** $350M

### Scenario 3: IPO (Year 5)
- **ARR:** $150M+
- **Valuation Multiple:** 15x ARR (public market)
- **Market Cap:** $2.25B

---

## **Key Performance Indicators (KPIs)**

### Growth Metrics
- **Monthly Recurring Revenue (MRR):** Track weekly
- **Annual Recurring Revenue (ARR):** Primary investor metric
- **Month-over-Month Growth:** Target 15-30%
- **Customer Count:** Total active paying users

### Retention Metrics
- **Monthly Churn Rate:** Target < 3%
- **Revenue Churn:** Target < 2% (negative churn ideal)
- **Net Revenue Retention:** Target > 110%
- **Customer Retention Rate:** 30-day, 90-day, 12-month

### Efficiency Metrics
- **CAC Payback Period:** Target < 12 months
- **LTV:CAC Ratio:** Target 3:1 minimum
- **Gross Margin:** Target > 85%
- **Magic Number:** (Net New ARR / Sales & Marketing Spend) > 0.75

### Product Metrics
- **Time to First Workflow:** Target < 5 minutes
- **Workflow Completion Rate:** Target > 85%
- **Classification Accuracy:** Target > 95%
- **Daily Active Users (DAU):** Engagement metric

---

**Last Updated:** January 11, 2025  
**Owner:** Finance & Strategy Team  
**Assumptions:** Conservative growth, 95% confidence interval
