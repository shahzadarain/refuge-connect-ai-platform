
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations = {
  en: {
    // Navigation
    'platform.title': 'Refugee Connect',
    'platform.subtitle': 'Employment Platform',
    'language.english': 'English',
    'language.arabic': 'العربية',
    
    // Landing page - Updated copy
    'landing.hero.title': 'Find Your Next',
    'landing.hero.subtitle': 'Opportunity',
    'landing.hero.description': 'Connecting you with trusted employers in Jordan using smart AI matching',
    'landing.cta.refugee': 'I am a Refugee',
    'landing.cta.employer': 'I am an Employer',
    'landing.login_link': 'Log In',
    'landing.first_time': 'First time here?',
    'landing.select_role': 'Choose your registration type',
    'landing.trust.indicator': 'Trusted by humanitarian organizations',
    'landing.powered_by': 'Powered by DAG - UNHCR Jordan',
    
    // Legacy keys for backward compatibility
    'landing.welcome': 'Welcome to Refugee Connect',
    'landing.description': 'Connecting Syrian refugees in Jordan with employment opportunities through AI-powered matching.',
    'landing.continue': 'Continue',
    
    // User roles
    'role.employer': 'Employer',
    'role.employer.description': 'Post jobs, search candidates, and connect with qualified refugees',
    'role.refugee': 'Refugee',
    'role.refugee.description': 'Find employment opportunities and connect with employers',
    'role.admin': 'Administrator',
    'role.admin.description': 'Manage platform users and oversee operations',
    
    // Registration forms
    'register.employer.title': 'Employer Registration',
    'register.refugee.title': 'Refugee Registration',
    'register.company_info': 'Company Information',
    'register.personal_info': 'Personal Information',
    'register.verification': 'Verification',
    
    // Form fields
    'form.company_name': 'Legal Company Name',
    'form.company_name.placeholder': 'Enter full legal name',
    'form.country': 'Country of Registration',
    'form.registration_number': 'Registration Number',
    'form.website': 'Website',
    'form.website.placeholder': 'https://...',
    'form.employees': 'Number of Employees',
    'form.about_company': 'About Company',
    'form.about_company.placeholder': 'Brief description of your company',
    'form.email': 'Email Address',
    'form.phone': 'Phone Number',
    'form.password': 'Password',
    'form.confirm_password': 'Confirm Password',
    'form.individual_id': 'Individual ID',
    'form.individual_id.help': 'This is your UNHCR or government issued ID',
    'form.date_of_birth': 'Date of Birth',
    'form.date_of_arrival': 'Date of Arrival in Jordan',
    'form.full_name': 'Full Name',
    'form.preferred_language': 'Preferred Language',
    
    // Buttons
    'button.next': 'Next',
    'button.back': 'Back',
    'button.submit': 'Submit',
    'button.continue': 'Continue',
    'button.verify': 'Verify and Continue',
    
    // Validation
    'validation.required': 'This field is required',
    'validation.email': 'Please enter a valid email address',
    'validation.phone': 'Please enter a valid phone number',
    'validation.password': 'Password must be at least 8 characters',
    'validation.password_match': 'Passwords do not match',
    
    // Status messages
    'status.pending_approval': 'Registration submitted successfully. Awaiting approval.',
    'status.contact_support': 'Need help? Contact Support',
    
    // Employee count options
    'employees.1-10': '1-10 employees',
    'employees.11-50': '11-50 employees',
    'employees.51-200': '51-200 employees',
    'employees.201-500': '201-500 employees',
    'employees.500+': '500+ employees',

    // Refugee Registration specific translations
    'refugee.portal.title': 'Refugee Portal',
    'refugee.registration.title': 'Register as a Refugee',
    'refugee.registration.subtitle': 'Welcome to Refugee Connect. We need to verify your UNHCR information to ensure you have access to the right opportunities and support.',
    'refugee.step.unhcr': 'UNHCR Verification',
    'refugee.step.account': 'Account Setup',
    'refugee.unhcr.title': 'UNHCR Verification Details',
    'refugee.unhcr.validation.title': 'UNHCR Validation Required',
    'refugee.unhcr.validation.description': 'To ensure the safety and integrity of our platform, we validate your information against UNHCR records during registration. This information is kept confidential and is only used for verification purposes.',
    'refugee.account.title': 'Create Your Account',
    'refugee.account.subtitle': 'Set up your account details to start exploring job opportunities and connecting with employers.',
    'refugee.account.info.title': 'Account Information',
    'refugee.continue.account': 'Continue to Account Setup',
    'refugee.create.account': 'Create Account',
    'refugee.creating.account': 'Creating Account & Validating...',
    'refugee.form.individual_id': 'UNHCR Individual ID',
    'refugee.form.individual_id.placeholder': 'REF123456',
    'refugee.form.individual_id.help': 'Enter your UNHCR registration number exactly as shown on your card',
    'refugee.form.full_name.placeholder': 'Enter your full name as on UNHCR card',
    'refugee.form.phone.placeholder': '+962781234567',
    'refugee.form.password.help': 'Minimum 6 characters',
    'refugee.registration.success': 'Registration Successful!',
    'refugee.registration.success.description': 'Your account has been created and validated. Redirecting to login...',
    'refugee.registration.failed': 'Registration Failed',
    'refugee.validation.date.format': 'Please enter date in format YYYY-MM-DD',
    'refugee.validation.password.min': 'Password must be at least 6 characters',
    'refugee.validation.password.match': 'Passwords do not match',
    'refugee.error.unhcr.failed': 'UNHCR validation failed. Please check your UNHCR ID and dates.',
    'refugee.error.email.exists': 'This email is already registered.',
    'refugee.error.network': 'Network error: Unable to connect to the server. Please check your internet connection and try again.',
    'refugee.error.server': 'Network error: The server may be temporarily unavailable. Please try again later.',
    'refugee.error.cors': 'Server configuration error: Cross-origin request blocked. Please contact support.',
    'refugee.error.registration': 'Registration Error'
  },
  ar: {
    // Navigation
    'platform.title': 'منصة ربط اللاجئين',
    'platform.subtitle': 'منصة التوظيف',
    'language.english': 'English',
    'language.arabic': 'العربية',
    
    // Landing page - Updated copy
    'landing.hero.title': 'ابحث عن',
    'landing.hero.subtitle': 'فرصتك القادمة',
    'landing.hero.description': 'نربطك بأصحاب العمل الموثوقين في الأردن باستخدام التطابق الذكي',
    'landing.cta.refugee': 'أنا لاجئ',
    'landing.cta.employer': 'أنا صاحب عمل',
    'landing.login_link': 'تسجيل الدخول',
    'landing.first_time': 'أول مرة هنا؟',
    'landing.select_role': 'اختر نوع التسجيل',
    'landing.trust.indicator': 'موثوق من قبل المنظمات الإنسانية',
    'landing.powered_by': 'مدعوم من DAG - مفوضية الأمم المتحدة الأردن',
    
    // Legacy keys for backward compatibility
    'landing.welcome': 'مرحباً بك في منصة ربط اللاجئين',
    'landing.description': 'ربط اللاجئين السوريين في الأردن بفرص العمل من خلال المطابقة المدعومة بالذكاء الاصطناعي.',
    'landing.continue': 'متابعة',
    
    // User roles
    'role.employer': 'صاحب عمل',
    'role.employer.description': 'انشر الوظائف، ابحث عن المرشحين، وتواصل مع اللاجئين المؤهلين',
    'role.refugee': 'لاجئ',
    'role.refugee.description': 'ابحث عن فرص العمل وتواصل مع أصحاب العمل',
    'role.admin': 'مدير',
    'role.admin.description': 'إدارة مستخدمي المنصة والإشراف على العمليات',
    
    // Registration forms
    'register.employer.title': 'تسجيل صاحب العمل',
    'register.refugee.title': 'تسجيل اللاجئ',
    'register.company_info': 'معلومات الشركة',
    'register.personal_info': 'المعلومات الشخصية',
    'register.verification': 'التحقق',
    
    // Form fields
    'form.company_name': 'الاسم القانوني للشركة',
    'form.company_name.placeholder': 'أدخل الاسم القانوني الكامل',
    'form.country': 'بلد التسجيل',
    'form.registration_number': 'رقم التسجيل',
    'form.website': 'الموقع الإلكتروني',
    'form.website.placeholder': 'https://...',
    'form.employees': 'عدد الموظفين',
    'form.about_company': 'عن الشركة',
    'form.about_company.placeholder': 'وصف مختصر عن شركتك',
    'form.email': 'عنوان البريد الإلكتروني',
    'form.phone': 'رقم الهاتف',
    'form.password': 'كلمة المرور',
    'form.confirm_password': 'تأكيد كلمة المرور',
    'form.individual_id': 'رقم الهوية الفردية',
    'form.individual_id.help': 'هذا هو رقم هويتك الصادر من المفوضية أو الحكومة',
    'form.date_of_birth': 'تاريخ الميلاد',
    'form.date_of_arrival': 'تاريخ الوصول إلى الأردن',
    'form.full_name': 'الاسم الكامل',
    'form.preferred_language': 'اللغة المفضلة',
    
    // Buttons
    'button.next': 'التالي',
    'button.back': 'العودة',
    'button.submit': 'إرسال',
    'button.continue': 'متابعة',
    'button.verify': 'تحقق ومتابعة',
    
    // Validation
    'validation.required': 'هذا الحقل مطلوب',
    'validation.email': 'يرجى إدخال عنوان بريد إلكتروني صحيح',
    'validation.phone': 'يرجى إدخال رقم هاتف صحيح',
    'validation.password': 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
    'validation.password_match': 'كلمات المرور غير متطابقة',
    
    // Status messages
    'status.pending_approval': 'تم إرسال التسجيل بنجاح. في انتظار الموافقة.',
    'status.contact_support': 'تحتاج مساعدة؟ اتصل بالدعم',
    
    // Employee count options
    'employees.1-10': '1-10 موظفين',
    'employees.11-50': '11-50 موظف',
    'employees.51-200': '51-200 موظف',
    'employees.201-500': '201-500 موظف',
    'employees.500+': 'أكثر من 500 موظف',

    // Refugee Registration specific translations
    'refugee.portal.title': 'بوابة اللاجئين',
    'refugee.registration.title': 'تسجيل كلاجئ',
    'refugee.registration.subtitle': 'مرحباً بك في منصة ربط اللاجئين. نحتاج للتحقق من معلومات المفوضية لضمان حصولك على الفرص والدعم المناسب.',
    'refugee.step.unhcr': 'التحقق من المفوضية',
    'refugee.step.account': 'إعداد الحساب',
    'refugee.unhcr.title': 'تفاصيل التحقق من المفوضية',
    'refugee.unhcr.validation.title': 'التحقق من المفوضية مطلوب',
    'refugee.unhcr.validation.description': 'لضمان سلامة وأمان منصتنا، نقوم بالتحقق من معلوماتك مع سجلات المفوضية أثناء التسجيل. هذه المعلومات سرية وتستخدم فقط لأغراض التحقق.',
    'refugee.account.title': 'إنشاء حسابك',
    'refugee.account.subtitle': 'قم بإعداد تفاصيل حسابك لبدء استكشاف فرص العمل والتواصل مع أصحاب العمل.',
    'refugee.account.info.title': 'معلومات الحساب',
    'refugee.continue.account': 'متابعة إلى إعداد الحساب',
    'refugee.create.account': 'إنشاء حساب',
    'refugee.creating.account': 'إنشاء الحساب والتحقق...',
    'refugee.form.individual_id': 'رقم المفوضية الفردي',
    'refugee.form.individual_id.placeholder': 'REF123456',
    'refugee.form.individual_id.help': 'أدخل رقم تسجيل المفوضية كما هو مكتوب على البطاقة تماماً',
    'refugee.form.full_name.placeholder': 'أدخل اسمك الكامل كما هو على بطاقة المفوضية',
    'refugee.form.phone.placeholder': '+962781234567',
    'refugee.form.password.help': 'أقل شيء 6 أحرف',
    'refugee.registration.success': 'تم التسجيل بنجاح!',
    'refugee.registration.success.description': 'تم إنشاء حسابك والتحقق منه. سيتم توجيهك لتسجيل الدخول...',
    'refugee.registration.failed': 'فشل التسجيل',
    'refugee.validation.date.format': 'يرجى إدخال التاريخ بالصيغة YYYY-MM-DD',
    'refugee.validation.password.min': 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
    'refugee.validation.password.match': 'كلمات المرور غير متطابقة',
    'refugee.error.unhcr.failed': 'فشل التحقق من بيانات المفوضية. يرجى التحقق من رقم المفوضية والتواريخ.',
    'refugee.error.email.exists': 'هذا البريد الإلكتروني مسجل بالفعل.',
    'refugee.error.network': 'خطأ في الشبكة: تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.',
    'refugee.error.server': 'خطأ في الشبكة: قد يكون الخادم غير متاح مؤقتاً. يرجى المحاولة لاحقاً.',
    'refugee.error.cors': 'خطأ في إعداد الخادم: تم حظر الطلب. يرجى الاتصال بالدعم.',
    'refugee.error.registration': 'خطأ في التسجيل'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Load saved language from localStorage or default to 'en'
    const savedLanguage = localStorage.getItem('preferred-language');
    return (savedLanguage as Language) || 'en';
  });

  useEffect(() => {
    // Set document direction and language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Save language preference to localStorage
    localStorage.setItem('preferred-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
    isRTL: language === 'ar'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
