import { Metadata } from "next";
import "./privacy.css";

export const metadata: Metadata = {
  title: "Privacy Policy | Pentamaths - JC H2 Math Tuition",
  description: "Privacy Policy for Pentamaths tutoring services. Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicy() {
  return (
    <div className="privacy-policy">

      <h1>Privacy Policy</h1>
      <p className="last-updated">Last updated: {new Date().toLocaleDateString('en-SG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <h2>1. Introduction</h2>
      <p>
        Pentamaths ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website pentamaths.sg or engage with our tutoring services.
      </p>

      <h2>2. Information We Collect</h2>

      <h3>2.1 Personal Information</h3>
      <p>We may collect personal information that you voluntarily provide to us when you:</p>
      <ul>
        <li>Contact us through our website contact form</li>
        <li>Send us emails or messages</li>
        <li>Register for our tutoring services</li>
        <li>Subscribe to our newsletter or updates</li>
      </ul>

      <p>This information may include:</p>
      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>School and academic level</li>
        <li>Parent/guardian contact information (for students under 18)</li>
      </ul>

      <h3>2.2 Automatically Collected Information</h3>
      <p>When you visit our website, we may automatically collect certain information about your device, including:</p>
      <ul>
        <li>IP address</li>
        <li>Browser type and version</li>
        <li>Operating system</li>
        <li>Referring website</li>
        <li>Pages viewed and time spent on our site</li>
        <li>Date and time of your visit</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide and maintain our tutoring services</li>
        <li>Respond to your inquiries and provide customer support</li>
        <li>Send you information about our services and educational content</li>
        <li>Improve our website and services</li>
        <li>Comply with legal obligations</li>
        <li>Protect our rights and prevent fraud</li>
      </ul>

      <h2>4. Cookies and Tracking Technologies</h2>
      <p>
        Our website uses cookies and similar tracking technologies to enhance your browsing experience. Cookies are small text files stored on your device that help us analyze web traffic and improve our services.
      </p>

      <p>We may use:</p>
      <ul>
        <li><strong>Essential cookies:</strong> Required for basic website functionality</li>
        <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our website</li>
        <li><strong>Marketing cookies:</strong> Used to deliver relevant advertisements</li>
      </ul>

      <p>You can control cookies through your browser settings, but disabling certain cookies may affect website functionality.</p>

      <h2>5. Third-Party Services</h2>
      <p>Our website may integrate with third-party services, including:</p>
      <ul>
        <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
        <li><strong>Google Ads:</strong> For advertising and remarketing purposes</li>
        <li><strong>reCAPTCHA:</strong> For form security and spam prevention</li>
        <li><strong>YouTube:</strong> For embedded educational videos</li>
        <li><strong>Email services:</strong> For communication and newsletters</li>
      </ul>

      <p>
        These third-party services have their own privacy policies and may collect information independently. We encourage you to review their privacy policies.
      </p>

      <h2>6. Data Sharing and Disclosure</h2>
      <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
      <ul>
        <li>With your explicit consent</li>
        <li>To comply with legal obligations or court orders</li>
        <li>To protect our rights, property, or safety, or that of others</li>
        <li>In connection with a business transfer or merger</li>
        <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
      </ul>

      <h2>7. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
      </p>

      <h2>8. Data Retention</h2>
      <p>
        We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law.
      </p>

      <h2>9. Your Rights</h2>
      <p>Under Singapore's Personal Data Protection Act (PDPA), you have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Correct inaccurate personal data</li>
        <li>Withdraw consent for data processing</li>
        <li>Request deletion of your personal data (subject to legal requirements)</li>
      </ul>

      <h2>10. Children's Privacy</h2>
      <p>
        Our services are primarily directed at students, including those under 18. We collect personal information from minors only with parental or guardian consent and in compliance with applicable laws.
      </p>

      <h2>11. International Data Transfers</h2>
      <p>
        Your information may be processed in countries other than Singapore. We ensure that any international transfers comply with applicable data protection laws and provide adequate protection for your personal information.
      </p>

      <h2>12. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
      </p>

      <h2>13. Contact Information</h2>
      <div className="contact-info">
        <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
        <p>
          <strong>Pentamaths</strong><br />
          Email: contact@pentamaths.sg<br />
          Address: Near Kovan MRT Station, Singapore
        </p>
        <p>
          For data protection inquiries, you may also contact the Personal Data Protection Commission Singapore at <a href="https://www.pdpc.gov.sg" target="_blank" rel="noopener noreferrer">www.pdpc.gov.sg</a>.
        </p>
      </div>
    </div>
  );
}