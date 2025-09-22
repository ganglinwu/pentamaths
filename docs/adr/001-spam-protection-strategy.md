# ADR-001: Multi-Layer Spam Protection with Silent Honeypot Strategy

## Status
Accepted

## Date
2025-09-22

## Context
The Pentamaths tuition business landing page contact form was experiencing spam submissions, which creates noise for lead generation and wastes business resources on irrelevant inquiries. We needed to implement effective spam protection while maintaining excellent user experience for legitimate students and parents.

## Decision
We implemented a multi-layer spam protection system with the following components:

### 1. Silent Honeypot Strategy
Instead of alerting spammers when they trigger honeypots, we silently accept their submissions but discard them on the backend. This prevents bots from learning and adapting their methods.

**Implementation:**
- Show success message to all submissions (legitimate and spam)
- Log spam attempts for analysis
- Add artificial delay (2 seconds) for spam vs 1 second for legitimate submissions
- Reset forms consistently to maintain behavioral patterns

### 2. Hidden Decoy Fields
Three legitimate-looking but hidden form fields that only bots will fill:
- `website` (URL field with "Your website" placeholder)
- `phoneNumber` (Tel field with "Phone number" placeholder)
- `companyName` (Text field with "Company name" placeholder)

### 3. Contextual Education Level Honeypot
A dropdown with both legitimate and honeypot options specific to our business:

**Legitimate Options (processed normally):**
1. H2 Mathematics (JC) - Primary offering
2. H1 Mathematics (JC) - Secondary offering
3. A Mathematics (Sec 3-4) - Secondary offering

**Honeypot Options (silently discarded):**
- E Mathematics (Sec 3-4)
- Sec 1/2 Mathematics
- Primary Mathematics
- H3 Mathematics (JC)
- IB Mathematics
- University Mathematics
- Adult Mathematics

### 4. Email Validation
- Format validation using regex
- Disposable email domain blocking
- Common disposable domains: 10minutemail.com, guerrillamail.com, mailinator.com, etc.

### 5. Client-side Rate Limiting
- 30-second minimum delay between submissions from same browser session
- Prevents rapid-fire bot submissions

### 6. Google reCAPTCHA (Optional)
- Framework prepared for reCAPTCHA v2 integration
- Can be enabled when spam volume increases

## Rationale

### Why Silent Honeypots?
Traditional honeypots that alert users when triggered create a feedback loop:
1. Bot attempts submission
2. Gets error message
3. Bot operator refines their approach
4. Repeat until bot bypasses protection

Silent honeypots break this cycle:
1. Bot attempts submission
2. Gets success message
3. Bot operator thinks method works
4. Bot continues using broken method indefinitely

### Why Contextual Education Level Honeypot?
Generic honeypots (like "Do not fill this field") are easily detected. Our education level honeypot is:
- **Business-specific**: Only catches irrelevant inquiries
- **Natural-looking**: Appears as legitimate dropdown options
- **Self-filtering**: Even confused humans learn about our actual services
- **Hard to detect**: Bots can't easily guess which levels are "wrong"

### Why This Specific Order?
The dropdown order reflects business priorities:
1. H2 Math first (primary revenue source)
2. H1 Math second (easier upsell path)
3. A Math third (pipeline for future H2 students)
4. Spam options mixed in naturally

## Consequences

### Positive
- **Highly effective spam reduction** without user friction
- **Bots don't adapt** due to false success feedback
- **Business-relevant filtering** - only catch truly irrelevant inquiries
- **Scalable approach** - multiple layers provide redundancy
- **Analytics capability** - spam attempts logged for pattern analysis
- **Resource efficiency** - minimal server processing for spam

### Negative
- **Complexity** - More sophisticated than basic validation
- **Maintenance** - Disposable email list needs occasional updates
- **False positives risk** - Legitimate users selecting wrong education level (mitigated by business focus)

### Neutral
- **Client-side detection** - Can be bypassed by sophisticated attackers (acceptable for current threat level)
- **Rate limiting** - Only prevents rapid submissions, not persistent slow attacks

## Implementation Notes

### Form Field Structure
```typescript
const [formData, setFormData] = useState({
  // Legitimate fields
  fullName: '',
  email: '',
  subjectLevel: '',
  message: '',

  // Hidden honeypot fields
  website: '',
  phoneNumber: '',
  companyName: ''
});
```

### Spam Detection Logic
```typescript
let isSpam = false;
let spamReason = '';

// Check decoy fields
if (formData.website || formData.phoneNumber || formData.companyName) {
  isSpam = true;
  spamReason = 'Decoy fields filled';
}

// Check education level
const validLevels = ['h2-maths', 'h1-maths', 'a-maths'];
if (formData.subjectLevel && !validLevels.includes(formData.subjectLevel)) {
  isSpam = true;
  spamReason = 'Invalid education level selected';
}
```

### Silent Handling
```typescript
if (isSpam) {
  // Log for analysis
  console.log(`Spam submission blocked: ${spamReason}`);

  // Waste bot time
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Show fake success
  alert('Thank you for your message! We\'ll get back to you soon.');
} else {
  // Process legitimate submission
  await submitToBackend(formData);
  alert('Thank you for your message! We\'ll get back to you soon.');
}
```

## Future Considerations

### When to Add reCAPTCHA
- If spam volume increases significantly
- If sophisticated bots bypass current protection
- For regulatory compliance requirements

### Potential Enhancements
- Server-side rate limiting by IP address
- Machine learning spam detection
- A/B testing different honeypot strategies
- Integration with spam detection services

### Monitoring Requirements
- Track spam detection rates by method
- Monitor false positive rates
- Analyze spam patterns for refinement

## Related Documents
- `/RECAPTCHA_SETUP.md` - reCAPTCHA integration guide
- Contact form implementation in `/src/app/page.tsx`

## References
- [Honeypot Techniques](https://blog.hubspot.com/website/what-is-honeypot-spam)
- [Silent Spam Handling Best Practices](https://security.stackexchange.com/questions/94116/should-i-inform-users-that-their-message-was-rejected-as-spam)
- [Form Spam Prevention Strategies](https://developers.google.com/recaptcha/docs/faq)