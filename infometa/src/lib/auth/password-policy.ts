import { createHash } from 'crypto';

export interface PasswordCheckResult {
  valid:    boolean;
  score:    number;
  reason?:  string;
  feedback: string[];
}

export function validatePasswordStrength(
  password: string,
  userContext: string[] = [],
): PasswordCheckResult {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 12) {
    return {
      valid: false, score: 0,
      reason: 'Password must be at least 12 characters',
      feedback,
    };
  }
  if (password.length >= 16) score += 20;
  else score += 10;

  const hasUpper   = /[A-Z]/.test(password);
  const hasLower   = /[a-z]/.test(password);
  const hasDigit   = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  if (!hasUpper)   feedback.push('Add uppercase letters');
  if (!hasLower)   feedback.push('Add lowercase letters');
  if (!hasDigit)   feedback.push('Add numbers');
  if (!hasSpecial) feedback.push('Add special characters (!@#$%)');

  if (hasUpper)   score += 15;
  if (hasLower)   score += 15;
  if (hasDigit)   score += 15;
  if (hasSpecial) score += 20;

  const commonPatterns = [
    /^(.)\1+$/,
    /^(012|123|234|345|456|567|678|789|890)+/,
    /^(abc|bcd|cde|def)+/i,
    /password/i,
    /qwerty/i,
    /letmein/i,
    /welcome/i,
    /infometa/i,
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      return {
        valid: false, score: 0,
        reason: 'Password is too common or predictable',
        feedback,
      };
    }
  }

  for (const context of userContext) {
    if (context && context.length >= 5 && password.toLowerCase().includes(context.toLowerCase().slice(0, 5))) {
      return {
        valid: false, score: 0,
        reason: 'Password must not contain your name or email',
        feedback,
      };
    }
  }

  const uniqueChars = new Set(password.split('')).size;
  if (uniqueChars >= 10) score += 15;

  const valid = score >= 50 && hasUpper && hasLower && hasDigit && hasSpecial;

  return {
    valid,
    score: Math.min(score, 100),
    reason: valid ? undefined : 'Password does not meet security requirements',
    feedback: valid ? [] : feedback,
  };
}

export async function isPasswordBreached(password: string): Promise<boolean> {
  try {
    const hash   = createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
    });
    if (!response.ok) return false;

    const text  = await response.text();
    return text.split('\n').some(line => line.startsWith(suffix));
  } catch {
    return false;
  }
}
