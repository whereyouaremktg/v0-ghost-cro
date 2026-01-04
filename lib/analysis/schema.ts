/**
 * Store Analysis Schema
 * 
 * Detailed structured schema for capturing specific, actionable information
 * about Shopify stores during AI analysis.
 */

export interface StoreAnalysis {
  productPage: {
    title: {
      present: boolean
      text: string
      characterCount: number
      hasKeywords: boolean
    }
    description: {
      present: boolean
      wordCount: number
      hasBenefits: boolean
      hasSpecs: boolean
      hasUseCases: boolean
      readabilityScore: number // Flesch-Kincaid or similar
    }
    pricing: {
      visible: boolean
      hasCompareAt: boolean
      hasSaleIndicator: boolean
      position: "above_fold" | "below_fold"
    }
    images: {
      count: number
      hasZoom: boolean
      hasLifestyleImages: boolean
      hasProductOnlyImages: boolean
      quality: "high" | "medium" | "low"
    }
    trustSignals: {
      hasReviews: boolean
      reviewCount: number
      averageRating: number
      hasSecurityBadges: boolean
      hasGuarantees: boolean
      hasPaymentIcons: boolean
    }
    shipping: {
      infoVisible: boolean
      freeShippingMentioned: boolean
      deliveryEstimateShown: boolean
      shippingCostShown: boolean
    }
    cta: {
      buttonVisible: boolean
      buttonText: string
      buttonColor: string
      hasUrgency: boolean
      hasScarcity: boolean
    }
  }

  checkout: {
    guestCheckoutAvailable: boolean
    formFieldCount: number
    hasProgressIndicator: boolean
    paymentOptionsVisible: string[]
    trustBadgesPresent: boolean
    shippingRevealPoint: "product_page" | "cart" | "checkout"
  }

  technical: {
    pageLoadTime: number
    mobileResponsive: boolean
    hasErrors: boolean
    errors: string[]
  }

  overallIssues: Array<{
    category: string
    element: string
    issue: string
    severity: "critical" | "high" | "medium" | "low"
    recommendation: string
    estimatedCRImpact: { min: number; max: number }
  }>
}

/**
 * Helper function to create a default/empty StoreAnalysis
 */
export function createEmptyStoreAnalysis(): StoreAnalysis {
  return {
    productPage: {
      title: {
        present: false,
        text: "",
        characterCount: 0,
        hasKeywords: false,
      },
      description: {
        present: false,
        wordCount: 0,
        hasBenefits: false,
        hasSpecs: false,
        hasUseCases: false,
        readabilityScore: 0,
      },
      pricing: {
        visible: false,
        hasCompareAt: false,
        hasSaleIndicator: false,
        position: "below_fold",
      },
      images: {
        count: 0,
        hasZoom: false,
        hasLifestyleImages: false,
        hasProductOnlyImages: false,
        quality: "low",
      },
      trustSignals: {
        hasReviews: false,
        reviewCount: 0,
        averageRating: 0,
        hasSecurityBadges: false,
        hasGuarantees: false,
        hasPaymentIcons: false,
      },
      shipping: {
        infoVisible: false,
        freeShippingMentioned: false,
        deliveryEstimateShown: false,
        shippingCostShown: false,
      },
      cta: {
        buttonVisible: false,
        buttonText: "",
        buttonColor: "",
        hasUrgency: false,
        hasScarcity: false,
      },
    },
    checkout: {
      guestCheckoutAvailable: false,
      formFieldCount: 0,
      hasProgressIndicator: false,
      paymentOptionsVisible: [],
      trustBadgesPresent: false,
      shippingRevealPoint: "checkout",
    },
    technical: {
      pageLoadTime: 0,
      mobileResponsive: false,
      hasErrors: false,
      errors: [],
    },
    overallIssues: [],
  }
}




