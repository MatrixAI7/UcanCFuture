/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NumerologyProfile {
  lifePath: number;
  destiny: number;
  soulUrge: number;
  personality: number;
  birthdayNum: number;
  personalYear: number;
}

export interface DescriptionItem {
  title: string;
  keyword: string;
  keyStrengths: string[];
  keyChallenges: string[];
  advice: string;
}

export interface SectionAnalysis {
  id: number;
  title: string;
  description: string;
  iconName: string;
}
