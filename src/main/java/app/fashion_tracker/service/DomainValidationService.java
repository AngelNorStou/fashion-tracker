package app.fashion_tracker.service;

import org.springframework.stereotype.Service;

import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;
import java.util.Set;

@Service
public class DomainValidationService {

    // Known fake/placeholder domains that sometimes still resolve DNS
    // records, so the MX check alone wouldn't reliably catch them.
    private static final Set<String> BLOCKED_DOMAINS = Set.of(
            "example.com",
            "example.org",
            "example.net",
            "test.com",
            "mailinator.com",
            "tempmail.com",
            "guerrillamail.com",
            "10minutemail.com",
            "fake.com",
            "email.com"
    );

    public boolean isValidEmailDomain(String email) {
        String domain = extractDomain(email);

        if (domain == null) {
            return false;
        }

        if (BLOCKED_DOMAINS.contains(domain.toLowerCase())) {
            return false;
        }

        return hasMxRecord(domain);
    }

    private String extractDomain(String email) {
        int atIndex = email.indexOf('@');

        if (atIndex < 0 || atIndex == email.length() - 1) {
            return null;
        }

        return email.substring(atIndex + 1);
    }

    // Checks whether the domain has a mail server configured. Note:
    // this makes a live DNS query, so a transient network/DNS issue
    // will cause a legitimate domain to be rejected too -- there's no
    // way to fully distinguish "fake domain" from "DNS hiccup" without
    // a retry/queue mechanism, which is out of scope here.
    private boolean hasMxRecord(String domain) {
        Hashtable<String, String> env = new Hashtable<>();
        env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");

        try {
            DirContext context = new InitialDirContext(env);
            Attributes attributes = context.getAttributes(domain, new String[]{"MX"});
            Attribute mxAttribute = attributes.get("MX");

            return mxAttribute != null && mxAttribute.size() > 0;
        } catch (NamingException exception) {
            return false;
        }
    }
}