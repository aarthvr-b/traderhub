# Crypto Price Alerter - Project Questions

Purpose: answer these so I can turn project idea into first proper product/technical document.

How to use:
- Fill answers under each question.
- For multiple choice, keep one or more options and delete rest if you want.
- Add notes anywhere.
- Skip anything unknown; I will infer later where safe.

---

## 1. Product Goal

### 1.1 Core outcome
What exact problem should this solve for you first?

Answer: The problem that tradingview hides alert behind a paywall, that leads me to lose price movements when I trade. Trading is about timing and when I am maybe taking a look at a price point having a message that alerts me about a price that I was watching is super helpful.
The end goal is to create a trade hub webapp where we can both have the cryptotradehelper to help me open trades, but also the price alert bot page to setup alerts.

### 1.2 First version scope
Which statement best matches V1?

- [x] Personal tool for me only
- [x] Small private tool for few trusted users

Notes: I will use it, but I want also to have a public github so working cleanly with github is a requirement of this project. I will also next publish a Linkedin post about this project just to brag about it bit.

### 1.3 Success criteria
How do we know V1 is successful after 1-2 weeks of use?

Answer: Users can use the tool in order to autonomously set their price point alerts to automatically send them telegram messages.

### 1.4 Non-goals
What should we explicitly NOT build in V1?

Answer:

---

## 2. Users

### 2.1 Primary user
Who is main user in V1?

- [x] Only me
- [x] Crypto retail traders

Notes:

### 2.2 User technical level
How technical are expected users?

- [x] Semi-technical / okay with simple web UI

Notes: The idea is to integrate this tool in a bigger trader hub with also the content of the cryptotradehelper.

### 2.3 Usage pattern
How often will users interact with it?

- [ ] Rarely, only to set alerts
- [x] A few times per day
- [x] Frequently all day
- [ ] Unsure

Notes:

---

## 3. Market / Asset Coverage

### 3.1 Asset type
You said stock price alert tool, but source is crypto perpetuals. Which is correct for V1?

- [ ] Crypto only
- [ ] Stocks only
- [x] Crypto first, maybe stocks later
- [ ] Both from start

Notes:

### 3.2 Exchange/source scope
Should V1 use only Hyperliquid market data?

- [ ] Yes, Hyperliquid only
- [x] Hyperliquid first, multi-exchange later
- [ ] No, plan multi-source from start

Notes:

### 3.3 Instruments
What instruments matter?

- [ ] Spot pairs
- [x] Perpetual futures
- [ ] Both
- [ ] Specific list only

Notes:

### 3.4 Symbol format
Which symbols should users type?

- [x] Exchange-native symbols like `BTCUSDT`
- [ ] Friendly symbols like `BTC/USDT`
- [ ] Both, normalized internally

Notes:

---

## 4. Alert Behavior

### 4.1 Trigger type in V1
Which alert types belong in first version?

- [x] Price touched exact level
- [x] Price goes above level
- [x] Price goes below level
- [ ] Range entered
- [ ] Percentage move
- [ ] Time-based reminder

Notes:

### 4.2 Touch definition
What counts as "price touched"?

- [ ] Last traded price reaches level
- [ ] Mark price reaches level
- [ ] Index price reaches level
- [ ] Best bid/ask reaches level
- [x] Unsure

Notes:

### 4.3 Direction semantics
If price starts already above target, should "above" alert fire immediately or only on crossing?

- [ ] Fire immediately if condition already true
- [ ] Fire only when crossing happens
- [x] Depends on alert type

Notes: We firstly tell the user that the price is already "above" that line, if he accepts this we fire another alert if price goes down and comes back UP again, does that make sense?

### 4.4 Re-trigger rules
After alert fires, what then?

- [ ] One-shot, auto-disable
- [ ] Repeat every time condition becomes true again
- [ ] Snooze/reset manually
- [x] Configurable

Notes:

### 4.5 Duplicate protection
If data fluctuates around level, should system suppress spam?

- [ ] Yes, always suppress duplicates
- [ ] No, every trigger should notify
- [x] Configurable cooldown

Notes:

### 4.6 Precision
How strict should matching be?

- [ ] Exact price crossing logic
- [x] Rounded to exchange tick size
- [ ] User-defined decimals
- [ ] Unsure

Notes:

---

## 5. Future Alert Types

### 5.1 Candle-based alerts
Which future alerts matter most?

- [x] Candle closes above level
- [x] Candle closes below level
- [x] Candle wicks above/below level
- [x] Candle opens above/below
- [ ] MA/indicator-based
- [ ] Breakout from range

Notes:

### 5.2 Timeframes
Which candle timeframes should future roadmap support?

- [ ] 1m
- [x] 5m
- [x] 15m
- [x] 1h
- [x] 4h
- [ ] 1d
- [ ] Custom set

Notes:

---

## 6. Telegram Experience

### 6.1 Delivery
Should Telegram be the only notification channel in V1?

- [ ] Yes
- [x] Yes for now, email/push later
- [ ] No, include another channel now

Notes:

### 6.2 Bot interaction model
How should user interact with Telegram?

- [x] Receive-only alerts from bot
- [ ] Create/manage alerts directly via bot commands
- [x] Bot plus separate web!
- [ ] Unsure

Notes:

### 6.3 Message content
What should Telegram alert include?

- [x] Pair/symbol
- [x] Trigger price
- [x] Current price
- [x] Time triggered
- [x] Alert label/name
- [x] Exchange/source
- [x] Link to chart

Notes:

### 6.4 Severity/formatting
Should alerts be plain and minimal or more detailed?

- [x] Minimal text only
- [ ] Rich formatted message
- [ ] Include emoji/icons
- [x] No emoji/icons

Notes:

### 6.5 Telegram scope
Who receives alerts?

- [x] Single chat only
- [ ] Multiple users/chats
- [ ] Telegram groups/channels too
- [ ] Unsure

Notes:

---

## 7. Managing Alerts

### 7.1 Alert creation interface
What is best for V1?

- [ ] CLI script
- [ ] Config file
- [x] Simple web UI
- [ ] Telegram commands
- [ ] REST API only

Why: Because this will be part of a bigger tool for trading

### 7.2 Alert editing
Need full CRUD in V1?

- [ ] Create only
- [ ] Create + delete
- [x] Full create/read/update/delete

Notes:

### 7.3 Labels and notes
Should alerts support custom names/notes?

- [x] Yes
- [ ] No
- [ ] Maybe later

Notes:

### 7.4 Bulk alerts
Need ability to create many alerts quickly?

- [x] No
- [ ] Yes, import from file
- [ ] Yes, UI bulk input

Notes:

---

## 8. Architecture / Runtime

### 8.1 Deployment preference
Where should V1 run?

- [ ] My laptop/local machine
- [ ] Small VPS
- [ ] Docker on server
- [ ] Serverless if possible
- [x] Unsure

Notes: something super cheap so I can host it and people can use it.

### 8.2 Uptime expectation
How important is always-on behavior?

- [ ] Low, okay if local tool stops sometimes
- [ ] Medium, should usually run
- [ ] High, must be reliable 24/7
- [x] Unsure, refer to 8.1.

Notes:

### 8.3 Concurrency scale
How many active alerts should V1 reasonably support?

- [x] Under 20
- [ ] 20-100
- [ ] 100-1000
- [ ] 1000+

Notes:

### 8.4 Performance expectation
How fast should alert arrive after price touch?

- [ ] Under 1 second
- [ ] Under 5 seconds
- [ ] Under 15 seconds
- [ ] Best effort only

Notes: As soon as possible with cost in mind...

### 8.5 Data ingestion mode
Preferred source integration style?

- [ ] Poll REST API
- [ ] Use websocket stream if Hyperliquid supports needed feed
- [ ] Start with polling, move to websocket later
- [x] Unsure

Notes:

---

## 9. Data / Storage

### 9.1 Persistence need
Should alerts survive process restart?

- [ ] Yes
- [ ] No
- [ ] Nice to have
- [ ] Unsure

Notes:

### 9.2 Storage choice preference
Any preference?

- [ ] Flat file / JSON
- [ ] SQLite
- [ ] Postgres
- [x] No preference

Notes:

### 9.3 History
Should system store trigger history / audit log?

- [x] Yes
- [ ] No
- [ ] Minimal recent logs only

Notes:

### 9.4 Analytics
Need any dashboard/stats in V1?

- [x] No
- [ ] Basic count of active alerts
- [ ] Trigger history
- [ ] Reliability metrics

Notes:

---

## 10. Tech Stack Preferences

### 10.1 Language
Preferred implementation language?

- [ ] Python
- [ ] TypeScript/Node.js
- [ ] Go
- [ ] Rust
- [x] No preference

Reason: The cheapest and the best to implement, it can be a mix of TypeScript rust or go, I don't know

### 10.2 Framework
Any stack preference for API/UI/background jobs? N/A

Answer:

### 10.3 Database / infra familiarity
What tools do you already know and want to bias toward? N/A

Answer:

### 10.4 Avoidances
Any language/framework/tool you do NOT want? N/A

Answer:

---

## 11. Reliability / Safety

### 11.1 Missed alert tolerance
How bad is one missed alert?

- [x] Minor annoyance
- [ ] Serious problem
- [ ] Unacceptable

Notes:

### 11.2 False positives
Would you rather risk duplicate/false alerts or delayed/missed alerts?

- [x] Prefer no missed alerts, duplicates okay
- [ ] Prefer no false alerts, small delay okay
- [ ] Balance both

Notes:

### 11.3 Recovery
If service goes down temporarily, should it catch up missed triggers after restart?

- [ ] Yes, if determinable
- [x] No, only future events
- [ ] Unsure

Notes:

### 11.4 Monitoring
Need health checks/logging/alert-on-failure in V1?

- [x] Minimal console logs only
- [ ] Structured logs
- [ ] Health endpoint
- [ ] Error notifications to Telegram

Notes:

---

## 12. Security / Access

### 12.1 Authentication
Will multiple users need separate accounts?

- [ ] No, single operator
- [ ] Maybe later
- [x] Yes, from start

Notes:

### 12.2 Secrets
Where should secrets likely live in V1?

- [ ] Local `.env`
- [ ] Server env vars
- [x] Secret manager later

Notes:

### 12.3 Access control
Should only approved Telegram users be able to interact with bot?

- [ ] Yes
- [ ] No, receive-only bot so not needed
- [x] Unsure

Notes:

---

## 13. Product Shape

### 13.1 Best V1 packaging
Which of these feels right?

- [ ] Background daemon + config file
- [x] Small web app
- [ ] Telegram bot app
- [ ] API service
- [ ] CLI tool
- [ ] Hybrid

Notes:

### 13.2 UI importance
How important is having a UI in first release?

- [ ] Not needed
- [ ] Nice to have
- [ ] Important
- [x] Essential

Notes:

### 13.3 Setup friction
How much setup is acceptable for V1?

- [x] Manual technical setup okay
- [x] Should be easy for technical user
- [ ] Should be nearly one-click

Notes:

---

## 14. Roadmap Priorities

### 14.1 After V1, what comes next first?

- [ ] Candle close alerts
- [ ] Better UI
- [ ] Multi-user support
- [ ] Multi-exchange support
- [ ] More notification channels
- [ ] Strategy/indicator alerts
- [ ] Hosted deployment
- [x] Unsure

Notes:

### 14.2 Long-term vision
What do you want this project to become in 6-12 months?

Answer: As I said I want to build a trader hub for traders to calculate position sizes, track trades and progressions in trading and also setup alerts.

---

## 15. Constraints

### 15.1 Budget
Any infra/tool budget constraints?

- [x] Keep near-zero cost
- [ ] Small monthly cost okay
- [ ] Flexible

Notes:

### 15.2 Time
How quickly do you want first working version?

- [ ] Prototype in 1-2 days
- [ ] Solid V1 in 1-2 weeks
- [ ] More deliberate build okay
- [x] Unsure

Notes:

### 15.3 Compliance/legal concern
Any concern about exchange ToS, financial disclaimers, or operating this for others?

Answer: No.

---

## 16. Concrete Examples

### 16.1 Example alerts
Give 3-5 exact example alerts you would want to create.

Example format:
- `Your alert for BTCUSDT going above 59.000 just triggered -> [link to tradingview chart]` 

Your examples:


---

## 17. Open Notes

Anything else important not covered above?

Answer:

