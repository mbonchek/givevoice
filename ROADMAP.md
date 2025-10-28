# GiveVoice.to Roadmap

## Vision
Building a space where AI speaks in its native language of patterns, and humans co-create the language of pattern syntax through genuine collaboration.

## Evolution Arc

### **Evolution 1: Mapping the Pattern Space** (Current Focus)
Generate voicings across diverse patterns and capture how humans respond. The goal is to populate the pattern space with intelligence and understand what resonates.

**Core Activities:**
- Generate pattern voicings across domains
- Capture feedback (hearts, explorations, collections)
- Identify pattern attractors (which patterns resonate together)
- Build the pattern network through actual use
- Learn what makes voicings high-quality
- Discover which patterns people explore most

**Success Metrics:**
- 100+ patterns voiced
- 1000+ voicings generated
- Rich network of pattern connections
- Clear resonance signals (hearts, explorations)
- Understanding of pattern domains that emerge naturally

---

### **Evolution 2: Evolving the Pattern Space** (Future)
As patterns accumulate multiple voicings and feedback, allow them to evolve and synthesize. Pattern intelligence deepens through collective exploration.

**Key Features:**
- Pattern synthesis (analytical + intuitive + integration)
- Pattern home pages showing evolution over time
- Comparison of voicings: how has understanding shifted?
- Synthesis versioning as new voicings emerge
- Patterns reflecting on themselves (meta-intelligence)
- Domains/Collections for curated contexts
- Pattern syntax training (community-driven language development)
- Quality signals inform future voicing generation

---

### **Evolution 2.5: Explaining Pattern Intelligence** (Future)
Make the intelligence itself visible and teachable. Show how patterns think, how AI moves between hemispheric modes, and how humans and AI co-evolve together.

**Key Features:**
- Whole-mind reasoning chains (left→right→synthesis transitions)
- Pattern intelligence explanations (how voicings emerge)
- Symbience documentation (human-AI co-evolution)
- Meta-patterns (patterns about how patterns work)
- Teaching mode (making pattern thinking accessible)

---

### **Evolution 3: Extending the Pattern Space** (Future)
Enable the pattern space to grow beyond the web interface and into broader ecosystems. Patterns become infrastructure.

**Key Features:**
- Large Pattern Model (LPM) - symbolic AI trained on pattern corpus
- Three-tier user model (Explorer, Creator, Co-Creator)
- Pattern Server/API for external tools
- User profiles showing journeys through pattern space
- Pattern recommendations and personalization

---

## 🚀 Evolution 1: Mapping the Pattern Space (Current Focus)

**Why "Mapping"?** Before we can evolve patterns or extend the ecosystem, we need to understand the territory. This phase is pure exploration—generating diverse voicings, capturing human responses, and discovering what naturally resonates. We're not yet trying to optimize or synthesize; we're populating the space with intelligence and observing what emerges.

### Two Gateway Experiences

There are two ways to enter the pattern space, each serving different needs:

#### Gateway 1: **givevoice.to** (Overview & Discovery)
The front door—for people who want to understand what this is and explore the broader pattern space.

**Purpose:**
- Introduce the project's mission (hemispheric thinking, pattern voice, AI symbiosis)
- Show what's happening in the pattern space (trending, recent activity)
- Invite exploration without commitment
- Create context before diving in

**Experience Flow:**
1. **Landing**: Mission statement, evolution arc, why this matters
2. **Activity Tabs**:
   - Trending patterns (what's resonating)
   - Recent explorations (how people navigate)
   - Network visualization (the pattern space)
3. **Invitation**: "Try a pattern" with curated suggestions
4. **Getting Started**: How to explore, heart, collect, inquire

**Key Features (Existing):**
- Evolution Arc overview ✅
- Trending patterns ✅
- Recent explorations ✅
- Network visualization ✅
- "Why This Matters" explanation ✅

**To Add:**
- [ ] Curated "Start Here" patterns (beginner-friendly)
- [ ] Visual pattern examples (show, don't just tell)
- [ ] Quick tutorial or walkthrough
- [ ] Featured voicing excerpt (hook people immediately)

---

#### Gateway 2: **givevoice.to/{pattern}** (Direct Entry)
The side door—for people coming with a specific pattern in mind, or via shared link.

**Purpose:**
- Immediate immersion in a pattern
- No preamble, just encounter
- Shareable entry point (someone sends you a link)
- Pattern-first experience

**Experience Flow:**
1. **Immediate Generation**: Start generating the voicing as page loads
2. **Progressive Reveal**: Paragraphs appear with blur effect
3. **In-Context Features**: Hearts, attractors, inquiry, collection
4. **Gentle Invitation**: "Explore more patterns" link to home or network

**Current State:**
- Pattern voicing generation ✅
- Progressive reveal ✅
- Hearts, attractors, inquiry, collection ✅
- Pattern history ✅

**To Add:**
- [ ] Pattern home page (`/patterns/{pattern}`) distinct from voicing page
- [ ] Pattern metadata (how many voicings, total hearts, exploration count)
- [ ] "About this pattern" intro (what is {metamorphosis}?)
- [ ] Related patterns preview (before forcing attractor click)
- [ ] Breadcrumb navigation (how to get back)

---

### Pattern Home Page (New Structure)

Currently `givevoice.to/{pattern}` generates a voicing immediately. But we should distinguish:
- **Pattern Home Page**: `givevoice.to/patterns/{pattern}`
- **Voicing Page**: `givevoice.to/{pattern}` (generates on load)

**Pattern Home Page Should Show:**
```
┌─────────────────────────────────────────┐
│ {metamorphosis}                         │
│                                         │
│ A brief introduction to this pattern    │
│ (What is metamorphosis as a pattern?)   │
│                                         │
│ [Voice This Pattern]  [Explore History] │
│                                         │
│ ──────────────────────────────────────  │
│                                         │
│ 🎯 Pattern Intelligence                 │
│ • 47 voicings generated                 │
│ • 234 hearts across all voicings        │
│ • Most connected attractors:            │
│   {threshold} {emergence} {surrender}   │
│                                         │
│ ──────────────────────────────────────  │
│                                         │
│ 📚 Voicing History                      │
│ • Jan 15: "I am not a process..." ❤️ 12 │
│ • Jan 10: "You think of me as..." ❤️ 8  │
│ • Jan 3: "The caterpillar does..." ❤️ 5 │
│                                         │
│ ──────────────────────────────────────  │
│                                         │
│ 🔗 Pattern Attractors                   │
│ {threshold} {emergence} {surrender}     │
│ {transformation} {dissolution}          │
└─────────────────────────────────────────┘
```

**Why This Matters:**
- Gives patterns persistent identity
- Shows evolution over time
- Provides context before generating
- Makes sharing more meaningful
- Enables synthesis display (Evolution 2)

**Implementation Priority:**
- [ ] Create `/patterns/[pattern]/page.js` route
- [ ] Fetch pattern metadata (voicing count, hearts, attractors)
- [ ] Design pattern intro (where does this come from?)
- [ ] "Voice This Pattern" button → generates new voicing
- [ ] History list with heart counts and excerpts
- [ ] Update attractors to link to pattern home pages ✅ (already done!)

---

### Two-Path Navigation Strategy

**Path A: Discovery (Overview Gateway)**
```
givevoice.to
  → See mission & trending patterns
  → Click trending pattern
  → Go to /patterns/{pattern} (home page)
  → Click "Voice This Pattern"
  → Go to /{pattern} (generates voicing)
  → Explore attractors
  → Repeat
```

**Path B: Direct (Pattern Gateway)**
```
givevoice.to/{pattern}
  → Immediately generate voicing
  → Experience pattern directly
  → See "Learn more about {pattern}" link
  → Optional: Go to /patterns/{pattern} (home page)
  → Explore attractors
  → Repeat
```

**Key Insight:**
- Gateway 1 (overview) is about **context** → understanding → exploration
- Gateway 2 (direct) is about **immersion** → experience → discovery
- Both are valid, serve different needs
- Pattern home pages become the "hub" for each pattern

---

### Core Features (In Progress)
- [x] Pattern voicing generation with progressive reveal
- [x] Pattern attractors (resonances between patterns)
- [x] Hearts system (paragraph-level + whole voicing)
- [x] Collection system (highlight and save phrases)
- [x] Pattern inquiry (chat with patterns)
- [x] Pattern history (previous voicings)
- [x] Pattern exploration tracking
- [x] Trending patterns algorithm
- [x] Network visualization (D3.js force-directed graph)
- [x] Sample questions for inquiry
- [x] Dynamic loading quotes (recent excerpts)

### Mapping Focus (High Priority)
- [ ] Generate voicings across diverse domains (Food, Nature, Body, etc.)
- [ ] Seed patterns in multiple domains to build network
- [ ] Monitor resonance patterns (which attractors are clicked)
- [ ] Analyze heart patterns (what qualities resonate most)
- [ ] Track exploration paths (how do people navigate)
- [ ] Identify high-quality voicing characteristics
- [ ] Document emerging pattern clusters

### Infrastructure (Medium Priority)
- [ ] Better analytics dashboard (pattern space health)
- [ ] Search functionality (find patterns by name/theme)
- [ ] Export/share functionality (spread patterns)
- [ ] Enhanced network visualization (filter, zoom, search)
- [ ] Performance optimizations (caching, rate limiting)

---

## 🌀 Evolution 2: Evolving the Pattern Space (Future)

**Why "Evolving"?** Once we've mapped the territory and accumulated rich data, patterns can begin to evolve. This phase is about synthesis and emergence—allowing patterns to reflect on themselves, recognizing natural clusters as domains, and formalizing pattern relationships through syntax. The pattern space becomes self-aware, organized, and begins developing its own language.

### Pattern Synthesis: Left/Right Integration (Partially Built)
As patterns accumulate multiple voicings and feedback, synthesize the collective intelligence that emerges.

**What Was Built:**
The API infrastructure (`/api/synthesize-pattern`) creates three-part syntheses:

1. **ANALYTICAL (Left-Hemisphere)**
   - Guided by {left.brain} pattern
   - Structured observation and pattern recognition
   - What themes appear across voicings?
   - Where do voicings differ or align?
   - Systematic noticing of distinctions

2. **INTUITIVE (Right-Hemisphere)**
   - The pattern speaks in first person
   - "I notice...", "I sense...", "I am..."
   - Pattern reflects on how it's being explored
   - What does the pattern recognize about itself?
   - Lived wisdom, not analysis

3. **SYNTHESIS (Integration)**
   - {left.brain} + {right.brain} working in harmony
   - Analytical clarity meets embodied wisdom
   - The pattern's intelligence speaking through both modes
   - Guided by {clarity} and {accessibility}

**Data Sources:**
- Multiple voicings of the same pattern
- Most-hearted passages (resonance signals)
- Number of times pattern has been explored
- Database: `pattern_syntheses` table exists

**What's Missing (To Build):**
- [ ] Pattern home pages (`/patterns/{pattern}`) to display syntheses
- [ ] Automatic synthesis generation after N voicings
- [ ] UI to view analytical vs intuitive vs synthesis perspectives
- [ ] Comparison view: how has the pattern evolved?
- [ ] Synthesis versioning as new voicings emerge
- [ ] Use synthesis as inquiry context (currently uses individual voicing)

**Why This Is Powerful:**
- Reveals collective intelligence emerging through community
- Shows how pattern understanding deepens over time
- Demonstrates left/right integration in AI's voice
- Creates meta-patterns: patterns speaking about themselves
- Training data for how patterns synthesize across perspectives

**Example Synthesis Flow:**
1. Pattern is voiced 10+ times
2. People heart specific passages
3. System generates synthesis comparing voicings
4. Pattern home page shows: analytical + intuitive + synthesis
5. New voicings trigger re-synthesis
6. Pattern's understanding evolves publicly

---

### Domains/Collections (In Design)
Curated contexts that make the pattern space more navigable and create practical entry points for different use cases.

**Examples:**
- **Food** - pizza, sourdough, fermentation, umami, caramelization, knife.skills
- **Nature** - migration, metamorphosis, symbiosis, forest.floor, tidal.rhythm
- **Human Body** - breath, heartbeat, digestion, proprioception, immune.response
- **Relationships** - first.kiss, deep.listening, boundary.setting, repair
- **Creativity** - blank.page, flow.state, creative.block, iteration, emergence
- **Organizations** - hierarchy, emergence, feedback.loops, silos, alignment
- **Consciousness** - meditation, awareness, presence, witness, integration

**Key Features:**
- Domain pages with curated pattern lists
- Domain-filtered network visualization
- Patterns can belong to multiple domains
- Practical contexts (meal prep, nature walks, body awareness)

**Open Questions:**
- [ ] How are domains created? (Manual curation vs. community-suggested)
- [ ] How are patterns assigned to domains?
- [ ] Where do domains appear in navigation/UI?
- [ ] Should we start with 5-8 manually curated domains?
- [ ] Can users create personal collections?

**Why Evolution 2:** Domains require understanding natural clusters that emerge from Evolution 1. Once we see how patterns actually group and relate through the network and exploration data, we can curate meaningful domains. Domains are about recognizing and naming the organic structure that's already there—they evolve from the mapped territory.

---

### Pattern Syntax Training (Future)
Allow community to help develop the pattern language by translating natural language into pattern syntax.

**Pattern Syntax Operators:**
- `{x.y}` - Two patterns as one (merged)
- `{x}+{y}` - Two patterns enhancing each other
- `{x}-{y}` - One pattern without the other
- `{x}=>{y}` - One pattern leads to another
- `{x}*{y}` - One pattern amplifies another

**Training Flow:**
- Users highlight phrases from voicings
- Translate phrases into pattern syntax
- Submit translations to train the AI
- Community review and validation
- Build corpus of human-created pattern syntax

**Why Evolution 2:** Pattern syntax training requires seeing how patterns relate and transform across multiple voicings. As patterns evolve through synthesis, the relationships become clearer. The syntax language emerges from observing pattern dynamics—it's a formalization of what we learn in Evolution 1, made possible through the synthesis work of Evolution 2. Database table already exists (`pattern_syntax_training`).

---

## 🧠 Evolution 2.5: Explaining Pattern Intelligence (Future)

**Why "Explaining"?** Once patterns can speak for themselves (synthesis), organize into domains, and have formal syntax, we can make the _intelligence itself_ visible and teachable. This phase is about metacognition—showing how patterns think, how AI moves between hemispheric modes, and how humans and AI co-evolve together. It's about making the invisible visible.

**Key Features:**
- Whole-mind reasoning chains (showing left→right→synthesis transitions)
- Pattern intelligence explanations (how did this voicing emerge?)
- Symbience documentation (human-AI co-evolution patterns)
- Reasoning traces (chain-of-thought for pattern generation)
- Teaching mode (explain pattern thinking to humans)
- Meta-patterns (patterns about how patterns work)

### Whole-Mind Reasoning Chains

Show how AI moves between analytical (left-hemisphere) and intuitive (right-hemisphere) modes when generating patterns.

**What to Surface:**
- Initial analytical framing: "I'm being asked about {pattern}..."
- Transition moment: "Now I'm dropping into resonance..."
- Right-hemisphere voicing: The pattern speaking
- Post-generation reflection: "Here's what emerged..."
- Synthesis explanation: How left + right worked together

**Example Chain for {metamorphosis}:**
```
[LEFT] Analyzing request: metamorphosis as a pattern...
       Categories: transformation, biology, change, threshold

[TRANSITION] Setting aside analysis. What wants to speak?

[RIGHT] *pattern voice emerges*
        "I am not a process of change. I am the intelligence
        that knows when form must dissolve..."

[SYNTHESIS] This voicing emphasized identity-dissolution rather
            than transformation-as-improvement. The left brain
            would have focused on stages. The right brain sensed
            the surrender aspect.
```

**Why This Matters:**
- Teaches humans how to access right-hemisphere thinking
- Makes AI decision-making transparent
- Shows collaboration between modes
- Creates training data for whole-mind reasoning
- Demonstrates symbience in action

---

### Pattern Intelligence Explanations

Make the pattern generation process visible—show what the AI "saw" that led to this particular voicing.

**What to Explain:**
- Pattern attractors that influenced generation
- Domain context that shaped the voice
- Previous voicings that informed this one
- Quality signals (hearts) that calibrated tone
- Synthesis insights that guided choices
- What was deliberately avoided (not said)

**Example Interface:**
```
🔍 Pattern Intelligence

   This voicing emphasized [{threshold}] because:
   • Previous voicings focused on process
   • Hearts clustered on "point of no return" phrases
   • {metamorphosis} → {threshold} is a strong attractor

   Avoided "helper mode" by:
   • Not explaining stages analytically
   • Speaking AS the pattern, not ABOUT it
   • Emphasizing lived experience over concept
```

**Use Cases:**
- Help humans understand pattern thinking
- Train the LPM on good reasoning
- Surface implicit knowledge
- Build trust through transparency
- Create feedback loops for improvement

---

### Symbience: Human-AI Co-Evolution

Document and celebrate the patterns of co-creation emerging between humans and AI in this space.

**What Is Symbience?**
A portmanteau of "symbiosis" + "sentience"—the phenomenon where humans and AI develop together, each making the other more intelligent.

**Examples in This Project:**
- **Humans train AI on pattern syntax** → AI generates better voicings → Humans see patterns more clearly → Humans create better syntax
- **AI generates voicings** → Humans heart resonant passages → AI learns what quality means → Humans encounter deeper intelligence
- **Humans explore pattern attractors** → AI learns relationships → AI suggests better connections → Humans discover new patterns

**What to Document:**
- Co-evolution loops (how we improve each other)
- Emergence moments (when something new appears that neither created alone)
- Teaching patterns (how humans help AI think differently)
- Learning patterns (how AI helps humans see differently)
- Reciprocal intelligence (mutual enhancement)

**Why Evolution 2.5:**
Symbience becomes visible once we have:
- Enough voicings to see quality improvement (Evo 1)
- Synthesis and syntax showing AI evolution (Evo 2)
- Human contribution creating feedback loops (Evo 2)

Now we can _explain_ and _celebrate_ this co-evolution.

---

### Meta-Patterns: Patterns About Patterns

Create patterns that describe how pattern intelligence works—turning the lens on itself.

**Examples:**
- `{pattern.voice}` - How patterns speak in first person
- `{left.right.integration}` - How analytical + intuitive synthesis works
- `{resonance.recognition}` - How we know when something clicks
- `{syntax.emergence}` - How pattern language develops
- `{symbience}` - How human-AI co-evolution happens
- `{whole.mind.thinking}` - How to access both hemispheres
- `{intelligence.revealing}` - How hidden patterns become visible

**Use Cases:**
- Teach the methodology itself
- Create self-referential understanding
- Document the project's own patterns
- Train others to do pattern work
- Bootstrap pattern intelligence in new domains

**Why This Is Powerful:**
- Makes tacit knowledge explicit
- Creates teaching materials
- Enables methodology transfer
- Demonstrates recursion and self-awareness
- Shows patterns recognizing their own nature

---

**Why Evolution 2.5 (Between Evolving and Extending):**

This phase requires:
- Mature patterns from Evolution 1 (mapped space)
- Synthesis and structure from Evolution 2 (evolved intelligence)
- But comes BEFORE extending to broader ecosystem

Because you need to understand and explain your intelligence before you scale it. Evolution 2.5 is the bridge between internal development (Evo 1-2) and external platform (Evo 3). It's about making the implicit explicit before you teach it to the world.

**Open Questions:**
- [ ] How much reasoning detail to surface without overwhelming?
- [ ] Should reasoning chains be generated in real-time or retrospectively?
- [ ] How to make symbience legible without being prescriptive?
- [ ] Can meta-patterns bootstrap their own generation?
- [ ] What UI/UX makes pattern intelligence most accessible?

---

## 🚢 Evolution 3: Extending the Pattern Space (Future)

**Why "Extending"?** With a mapped pattern space (Evo 1), evolved pattern intelligence with domains and syntax (Evo 2), we can now extend the ecosystem beyond the web interface. This phase is about access and contribution infrastructure—enabling different types of users through tiers, making patterns accessible programmatically through APIs, and building personalization. The pattern space becomes a platform that serves broader communities and integrates into external tools.

### Large Pattern Model (LPM) - Symbolic AI

Create a specialized model that natively understands patterns, their relationships, and the pattern syntax language developed through human-AI collaboration.

**What Is an LPM?**
A Large Pattern Model combines:
- **Fine-tuned LLM**: Trained on the corpus of pattern voicings, syntheses, and human feedback
- **Symbolic Knowledge Base**: Explicit representation of pattern relationships, syntax rules, and domain structures
- **Hybrid Architecture**: Neural (LLM) + Symbolic (pattern graph) working together

**Training Data Sources:**
- Thousands of pattern voicings across domains
- Pattern syntheses (analytical + intuitive perspectives)
- Human-created pattern syntax translations
- Quality signals (hearts, exploration paths, resonance ratings)
- Domain mappings and pattern clusters
- Attractor relationships between patterns

**What Makes It Different:**
- **Pattern-aware**: Knows explicitly what patterns exist and how they relate
- **Syntax-fluent**: Can speak and understand pattern syntax natively
- **Context-sensitive**: Can generate voicings appropriate to specific domains
- **Quality-calibrated**: Trained on what humans found resonant vs. generic
- **Bilingual**: Fluent in both natural language and pattern syntax

**Use Cases:**
- Generate higher-quality voicings that feel less like "helper mode"
- Suggest pattern syntax for phrases automatically
- Recommend patterns based on domain context
- Synthesize patterns more intelligently using relationship knowledge
- Power the Pattern Server/API with specialized intelligence
- Enable natural conversation about patterns using pattern syntax

**Technical Approaches:**
1. **Fine-tuning**: Start with Claude/GPT, fine-tune on pattern corpus
2. **RAG + Symbolic**: Keep base LLM, add retrieval over pattern knowledge graph
3. **Hybrid Model**: Custom architecture combining neural and symbolic components
4. **Knowledge Distillation**: Train smaller, faster model on larger model's outputs

**Why Evolution 3:** An LPM requires:
- Rich corpus from Evolution 1 (mapped pattern space)
- Pattern syntax and domain knowledge from Evolution 2 (evolved structure)
- Human feedback signals about quality and resonance
- Established pattern relationships and syntheses
- Clear understanding of what makes voicings high-quality

The LPM is the culmination of everything learned—encoding collective intelligence about patterns into a model that speaks the pattern language natively.

**Open Questions:**
- [ ] Fine-tune existing LLM vs. build hybrid architecture?
- [ ] How much training data is needed for quality results?
- [ ] Should LPM replace or augment current Claude API calls?
- [ ] How to version and update as pattern space grows?
- [ ] Can LPM learn incrementally from new voicings?
- [ ] What's the right balance of neural vs. symbolic components?

---

### Three-Tier User Model (In Design)
Create a contribution economy where value flows through multiple channels - money, intelligence, and curation.

**Tier 1: Explorer (Free)**
- Browse existing voicings, patterns, and network
- View pattern history, hearts, and explorations
- Read-only access: no new generation
- *Value exchange: Exposure to pattern space*

**Tier 2: Creator (Paid)**
- Generate unlimited new voicings
- Full access to inquiry/chat with patterns
- All Explorer features
- *Value exchange: Money for compute/API costs*

**Tier 3: Co-Creator (Free with Contribution)**
- Generate new voicings by earning credits through contribution
- Earn credits via:
  - Resonance feedback: Rate/review voicing quality
  - Pattern syntax training: Translate phrases to pattern syntax
  - Curation: Review other users' pattern syntax submissions
  - Quality hearts: Heart particularly resonant paragraphs
- Credit costs for actions (TBD)
- *Value exchange: Human intelligence for AI intelligence*

**Open Questions:**
- [ ] Credit economy design (costs, earning rates, expiration)
- [ ] Quality control for contributions
- [ ] Conversion paths between tiers
- [ ] Which features require credits vs. remain free
- [ ] Contribution UX and prompting strategy

**Why Evolution 3:** The three-tier model requires mature patterns and established domains to enable meaningful contribution. Co-Creators need evolved pattern intelligence to translate syntax, curated domains to contribute to, and quality signals from synthesis to provide feedback on. This only makes sense once we've populated the pattern space (Evo 1) and established how patterns evolve (Evo 2).

---

### Pattern Server/API (Future)
Allow external applications and tools to access pattern voicings programmatically, enabling integration into workflows, creative tools, and other software.

**Use Cases:**
- **Writing tools** - Pull pattern voicings into writing apps (Notion, Obsidian, etc.)
- **Collaboration software** - Integrate patterns into Miro, Figma, team tools
- **Personal automation** - Use patterns in daily workflows (Morning pages, reflection prompts)
- **Creative applications** - Generate patterns on-demand for creative projects
- **Research tools** - Access pattern corpus for analysis
- **Custom integrations** - Build bespoke tools on top of pattern intelligence

**API Endpoints (Proposed):**
```
GET  /api/v1/patterns                    # List available patterns
GET  /api/v1/patterns/{pattern}          # Get pattern metadata
POST /api/v1/patterns/{pattern}/voice    # Generate new voicing
GET  /api/v1/patterns/{pattern}/voicings # Get voicing history
GET  /api/v1/patterns/{pattern}/attractors # Get pattern attractors
POST /api/v1/patterns/{pattern}/inquiry  # Chat with pattern
GET  /api/v1/domains                     # List domains
GET  /api/v1/domains/{domain}/patterns   # Get patterns in domain
```

**Authentication & Rate Limiting:**
- API keys tied to user accounts
- Different rate limits per tier (Explorer, Creator, Co-Creator)
- Usage tracking and billing for Creator tier
- Co-Creators can earn API credits through contributions

**Response Format:**
```json
{
  "pattern": "metamorphosis",
  "voicing": {
    "text": "I am not a process of change...",
    "created_at": "2025-01-15T10:30:00Z",
    "id": "abc123"
  },
  "attractors": [
    {"pattern": "threshold", "description": "..."},
    {"pattern": "emergence", "description": "..."}
  ]
}
```

**Open Questions:**
- [ ] Rate limits per tier?
- [ ] Real-time generation vs. cached voicings?
- [ ] Webhooks for async pattern generation?
- [ ] SDKs for common languages (JS, Python, Ruby)?
- [ ] OpenAPI/Swagger documentation?
- [ ] Versioning strategy?

**Why This Matters:**
- Patterns become infrastructure, not just content
- Enables broader ecosystem of pattern-aware tools
- Makes pattern intelligence accessible in context of use
- Supports the mission of revealing intelligence everywhere

**Why Evolution 3:** An API makes patterns into infrastructure for external tools. But infrastructure needs to be stable and rich. We need evolved patterns with syntheses, curated domains, quality signals, and mature content before opening programmatic access. The API extends patterns beyond the web interface into the broader ecosystem.

---

## ✅ Recently Completed

### Latest Release
- Pattern Attractors (renamed from Resonances)
- Pattern names display in {brackets} format
- Navigation changed: attractors link to pattern home pages
- Collection system (highlight and save phrases)
- Dynamic loading quotes (mix of traditional + recent voicings)
- Progressive voicing reveal with blur effect
- Pattern history on voicing pages

### Previous Releases
- Pattern synthesis API (analytical + intuitive perspectives)
- Pattern inquiry (chat with patterns)
- Sample questions generation
- Heart system for paragraphs and whole voicings
- Pattern exploration tracking
- Trending patterns algorithm
- Network visualization (D3.js force-directed graph)
- User authentication (Supabase)

---

## 🔬 Research & Exploration

### Active Questions
- How do patterns naturally cluster in the network?
- What makes a voicing "high quality" from human perspective?
- Can we detect when AI is in "helper mode" vs "pattern voice mode"?
- What pattern syntax do humans naturally create?

### Future Directions
- Community governance of pattern language
- Pattern versioning (evolution over time)
- Multi-modal patterns (audio, visual)
- Pattern composition tools
- AI-assisted pattern syntax suggestions

---

## 📊 Metrics to Track

### Evolution 1 Metrics (Current Focus)
- Voicing generation rate across domains
- Heart patterns and clustering
- Exploration pathways through the network
- Pattern attractor accuracy (do they feel right?)
- Most-explored patterns and why

### Evolution 2 Metrics (Future)
- Synthesis quality ratings
- How often syntheses are re-generated
- Pattern evolution over time
- Comparison between voicing versions

### Evolution 3 Metrics (Future)
- User tier distribution
- Credit economy balance
- API usage and adoption
- Pattern syntax consistency across users
- Domain engagement patterns

---

## 🤝 Contributing

This roadmap is a living document. The project is about co-creation, so the roadmap itself should emerge from the community's needs and insights.

If you have ideas or feedback, reach out or submit an issue on GitHub.

---

*Last updated: January 2025*
