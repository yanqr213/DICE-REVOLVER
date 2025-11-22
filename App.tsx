
import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Cpu, Eye, Zap, Shield, Heart, Swords, Crosshair, Database, TrendingUp, AlertTriangle, Anchor, BatteryCharging, Skull, Activity, Biohazard, Star, Flame, Crown } from 'lucide-react';
import { DieData, DieValue, GameState, WeaponDef, CombatResult, DamagePopup, ShopItem, Difficulty, WeaponType, CyberwareDef, BossModifier, Particle, EnemyIntent, EnemyActionType, RewardOption, TacticalMission, WeaponTriggerType, RewardRarity } from './types';
import { Die } from './components/Die';
import { Enemy } from './components/Enemy';
import { Controls } from './components/Controls';
import { WeaponCard } from './components/WeaponCard';
import { DamageFeedback } from './components/DamageFeedback';
import { ShopModal } from './components/ShopModal';
import { RewardModal } from './components/RewardModal';
import { GameOver } from './components/GameOver';
import { StartScreen } from './components/StartScreen';
import { VfxLayer } from './components/VfxLayer';
import { Background } from './components/Background';
import { BattleHUD } from './components/BattleHUD';
import { Encyclopedia } from './components/Encyclopedia';
import { CoinIcon, PlusIcon, HeartIcon, AimIcon, ShieldIcon, SwordIcon, BiohazardIcon, CrossbowIcon, RevolverIcon, ShotgunIcon, UziIcon, GrenadeIcon, TwinFangIcon, ExcaliburIcon, OmniBlasterIcon, LinearRailIcon, TacticalIcon, FlamethrowerIcon, RpgIcon, PlasmaIcon, VoidIcon, ShivIcon, DoomsdayIcon } from './components/Icons';
import { soundManager } from './utils/audio';

const INITIAL_DICE_COUNT = 5;
const MAX_DICE_CAP = 10;
const MAX_REROLLS = 3;

// --- DATA DEFINITIONS ---

const WEAPONS: WeaponDef[] = [
  // --- TIER 1: STARTERS ---
  { id: 'SINGULARITY', name: '奇点', triggerType: 'FIVE_KIND', req: '5条 (5-Kind)', baseChips: 150, baseMult: 50, color: '#f43f5e' },
  { id: 'FLUX_BEAM', name: '洪流', triggerType: 'BIG_STR', req: '大顺 (BigStr)', baseChips: 120, baseMult: 40, color: '#0ea5e9' },
  { id: 'QUADRA', name: '四重奏', triggerType: 'FOUR_KIND', req: '4条 (4-Kind)', baseChips: 80, baseMult: 20, color: '#a855f7' },
  { id: 'STRIKER', name: '突袭者', triggerType: 'SMALL_STR', req: '小顺 (SmStr)', baseChips: 50, baseMult: 10, color: '#22c55e' },
  { id: 'TRINITY', name: '三位一体', triggerType: 'THREE_KIND', req: '3条 (3-Kind)', baseChips: 40, baseMult: 5, color: '#eab308' },
  { id: 'FLAMETHROWER', name: 'HELL·地狱火', triggerType: 'FULL_HOUSE', req: '葫芦 (Full)', baseChips: 100, baseMult: 10, color: '#f97316' },
  { id: 'VECTOR', name: '维克托', triggerType: 'TWO_PAIR', req: '两对 (2-Pair)', baseChips: 30, baseMult: 3, color: '#ec4899' },
  { id: 'BUCKSHOT', name: '怒火', triggerType: 'PAIR', req: '一对 (Pair)', baseChips: 15, baseMult: 2, color: '#fb923c' },
  { id: 'PEACEMAKER', name: '和平缔造者', triggerType: 'SCATTER', req: '散牌 (Scatter)', baseChips: 5, baseMult: 1, color: '#94a3b8' },

  // --- TIER 2: EVOLUTIONS (3 Branches Per Weapon) ---

  // 1. PEACEMAKER
  { id: 'CROSSBOW', parentId: 'PEACEMAKER', name: '诸葛连弩', triggerType: 'SCATTER', req: '散牌', baseChips: 0, baseMult: 20, color: '#84cc16', isArtifact: true, description: '每次开火自动触发，无需条件' },
  { id: 'BOUNTY_HUNTER', parentId: 'PEACEMAKER', name: '赏金猎人', triggerType: 'SCATTER', req: '散牌', baseChips: 20, baseMult: 2, color: '#facc15', isArtifact: true, description: '每次触发获得 2 金币' },
  { id: 'DESPERADO', parentId: 'PEACEMAKER', name: '亡命徒', triggerType: 'SCATTER', req: '散牌', baseChips: 10, baseMult: 5, color: '#71717a', isArtifact: true, description: '若无剩余重随次数，倍率x5' },

  // 2. BUCKSHOT
  { id: 'MIDAS_HAND', parentId: 'BUCKSHOT', name: 'MIDAS·点金', triggerType: 'PAIR', req: '一对', baseChips: 50, baseMult: 5, color: '#fbbf24', isArtifact: true, description: '基础筹码 = 当前金币 / 2' },
  { id: 'TITAN_GRIP', parentId: 'BUCKSHOT', name: '泰坦之握', triggerType: 'PAIR', req: '一对', baseChips: 100, baseMult: 30, color: '#b45309', isArtifact: true, description: '若对子是 [6,6]，倍率+30' },
  { id: 'BUCKSHOT_NOVA', parentId: 'BUCKSHOT', name: '新星爆发', triggerType: 'PAIR', req: '一对', baseChips: 100, baseMult: 3, color: '#be185d', isArtifact: true, description: '额外增加等同于当前生命值的筹码' },

  // 3. VECTOR
  { id: 'TWIN_FANG', parentId: 'VECTOR', name: '双生毒牙', triggerType: 'TWO_PAIR', req: '两对', baseChips: 60, baseMult: 8, color: '#db2777', isArtifact: true, description: '触发两次伤害结算' },
  { id: 'AKIMBO', parentId: 'VECTOR', name: '双持暴徒', triggerType: 'TWO_PAIR', req: '两对', baseChips: 50, baseMult: 5, color: '#475569', isArtifact: true, description: '本回合每使用一次重随，倍率+3' },
  { id: 'RICOCHET', parentId: 'VECTOR', name: '跳弹', triggerType: 'TWO_PAIR', req: '两对', baseChips: 40, baseMult: 15, color: '#0ea5e9', isArtifact: true, description: '若两对数字相同 (四条)，伤害翻倍' },

  // 4. TRINITY
  { id: 'TACTICAL_EXEC', parentId: 'TRINITY', name: '战术终端', triggerType: 'THREE_KIND', req: '3条', baseChips: 100, baseMult: 15, color: '#10b981', isArtifact: true, description: '完成随机战术任务以获得额外奖励' },
  { id: 'VAMPIRE_FANG', parentId: 'TRINITY', name: '鲜血祭仪', triggerType: 'THREE_KIND', req: '3条', baseChips: 60, baseMult: 10, color: '#991b1b', isArtifact: true, description: '造成伤害的 20% 转化为生命恢复' },
  { id: 'TRI_FORCE', parentId: 'TRINITY', name: '三角力量', triggerType: 'THREE_KIND', req: '3条', baseChips: 80, baseMult: 25, color: '#eab308', isArtifact: true, description: '若骰子点数为奇数，伤害翻倍' },

  // 5. QUADRA
  { id: 'OMNI_BURST', parentId: 'QUADRA', name: '全域轰炸', triggerType: 'FOUR_KIND', req: '4+条', baseChips: 200, baseMult: 50, color: '#d946ef', isArtifact: true, description: '4条、5条、6条均可触发，且倍率极高' },
  { id: 'PLASMA_CANNON', parentId: 'QUADRA', name: '等离子炮', triggerType: 'FOUR_KIND', req: '4条', baseChips: 500, baseMult: 20, color: '#3b82f6', isArtifact: true, description: '基础筹码 +400' },
  { id: 'RAILGUN', parentId: 'QUADRA', name: '电磁轨道炮', triggerType: 'FOUR_KIND', req: '4条', baseChips: 150, baseMult: 80, color: '#22d3ee', isArtifact: true, description: '无视护盾 (倍率极高)' },

  // 6. SINGULARITY
  { id: 'EVENT_HORIZON', parentId: 'SINGULARITY', name: '视界线', triggerType: 'SIX_KIND', req: '6条', baseChips: 500, baseMult: 200, color: '#4c1d95', isArtifact: true, description: '需集齐6条，伤害毁灭性' },
  { id: 'BLACK_HOLE', parentId: 'SINGULARITY', name: '黑洞发生器', triggerType: 'FIVE_KIND', req: '5条', baseChips: 200, baseMult: 50, color: '#1e1b4b', isArtifact: true, description: '获得 500 点护盾' },
  { id: 'SUPERNOVA', parentId: 'SINGULARITY', name: '超新星', triggerType: 'FIVE_KIND', req: '5条', baseChips: 300, baseMult: 100, color: '#f59e0b', isArtifact: true, description: '若点数为 [6]，伤害 x5' },

  // 7. STRIKER
  { id: 'CHRONOS', parentId: 'STRIKER', name: 'TIME·时之轮', triggerType: 'SMALL_STR', req: '小顺', baseChips: 0, baseMult: 1, color: '#2dd4bf', isArtifact: true, description: '再次结算本轮所有已触发的伤害' },
  { id: 'ASSASSIN', parentId: 'STRIKER', name: '暗影刺客', triggerType: 'SMALL_STR', req: '小顺', baseChips: 80, baseMult: 20, color: '#0f172a', isArtifact: true, description: '必定暴击' },
  { id: 'FLASH_STEP', parentId: 'STRIKER', name: '瞬步', triggerType: 'SMALL_STR', req: '小顺', baseChips: 150, baseMult: 30, color: '#e2e8f0', isArtifact: true, description: '若在第1次投掷后触发，伤害 x3' },

  // 8. FLUX BEAM
  { id: 'PRISM_BEAM', parentId: 'FLUX_BEAM', name: '光棱塔', triggerType: 'SUPER_STR', req: '大满贯 (1-6)', baseChips: 300, baseMult: 100, color: '#06b6d4', isArtifact: true, description: '需集齐1-6点，终极激光' },
  { id: 'ORBITAL_CANNON', parentId: 'FLUX_BEAM', name: '轨道打击', triggerType: 'BIG_STR', req: '大顺', baseChips: 150, baseMult: 50, color: '#6366f1', isArtifact: true, description: '倍率随回合数增加 (xTurn)' },
  { id: 'HYPER_BEAM', parentId: 'FLUX_BEAM', name: '破坏死光', triggerType: 'BIG_STR', req: '大顺', baseChips: 250, baseMult: 80, color: '#dc2626', isArtifact: true, description: '消耗 20 HP，造成极大伤害' },

  // 9. FLAMETHROWER
  { id: 'INFERNO', parentId: 'FLAMETHROWER', name: '焦土政策', triggerType: 'DOUBLE_TRIPLE', req: '双三条', baseChips: 200, baseMult: 50, color: '#ea580c', isArtifact: true, description: '需两个三条，燃烧一切' },
  { id: 'MELTDOWN', parentId: 'FLAMETHROWER', name: '堆芯熔毁', triggerType: 'FULL_HOUSE', req: '葫芦', baseChips: 150, baseMult: 40, color: '#84cc16', isArtifact: true, description: '消耗所有护盾，每点护盾增加伤害' },
  { id: 'NAPALM', parentId: 'FLAMETHROWER', name: '凝固汽油', triggerType: 'FULL_HOUSE', req: '葫芦', baseChips: 120, baseMult: 30, color: '#f97316', isArtifact: true, description: '若对子是 [6,6]，倍率 x3' },

  // --- TIER 3: ULTIMATES (Lv 50 Reward) ---
  { id: 'EXCALIBUR', name: '誓约·胜利', triggerType: 'FLAVOR', req: 'ULTIMATE', baseChips: 999, baseMult: 999, color: '#fde047', isArtifact: true, description: '王者之剑' },
  { id: 'AEGIS_SYSTEM', name: '宙斯盾', triggerType: 'FLAVOR', req: 'ULTIMATE', baseChips: 500, baseMult: 500, color: '#60a5fa', isArtifact: true, description: '绝对防御转化为火力' },
  { id: 'RAGNAROK', name: '诸神黄昏', triggerType: 'FLAVOR', req: 'ULTIMATE', baseChips: 666, baseMult: 666, color: '#ef4444', isArtifact: true, description: '毁灭世界' },

  // --- FLAVOR (Legacy / Unused in main progression but kept for types) ---
  { id: 'DOOMSDAY', name: '末日', triggerType: 'FLAVOR', req: '总和 >= 24', baseChips: 80, baseMult: 8, color: '#b91c1c' },
  { id: 'PLASMA', name: '等离子', triggerType: 'FLAVOR', req: '全奇数', baseChips: 50, baseMult: 5, color: '#f59e0b' },
  { id: 'VOID', name: '虚空', triggerType: 'FLAVOR', req: '全偶数', baseChips: 50, baseMult: 5, color: '#6366f1' },
  { id: 'SHIV', name: '暗刃', triggerType: 'FLAVOR', req: '总和 <= 11', baseChips: 45, baseMult: 5, color: '#14b8a6' },
];

const CYBERWARE_POOL: CyberwareDef[] = [
    { 
        id: 'targeting_chip', name: '辅助瞄准芯片', desc: '怒火/进化型(一对)触发时筹码+30', rarity: 'COMMON', price: 25, icon: <AimIcon />,
        onCalculate: (ctx) => ['BUCKSHOT','MIDAS_HAND','TITAN_GRIP','BUCKSHOT_NOVA'].includes(ctx.weaponId) ? { chips: ctx.chips + 30 } : {}
    },
    {
        id: 'overclocker', name: '超频模组', desc: '若总和>20，倍率+4', rarity: 'RARE', price: 50, icon: <Cpu />,
        onCalculate: (ctx) => ctx.diceSum > 20 ? { mult: ctx.mult + 4 } : {}
    },
    {
        id: 'lucky_die', name: '黄金色子', desc: '30%概率倍率x1.5', rarity: 'LEGENDARY', price: 100, icon: <Zap />,
        onCalculate: (ctx) => Math.random() > 0.7 ? { mult: Math.floor(ctx.mult * 1.5) } : {}
    },
    {
        id: 'mechanic_peacemaker', name: '弹巢: 午时已到', desc: '和平缔造者系: 倍率等于最大点数', rarity: 'RARE', price: 75, icon: <RevolverIcon />,
        onCalculate: (ctx) => ['PEACEMAKER','CROSSBOW','BOUNTY_HUNTER','DESPERADO'].includes(ctx.weaponId) ? { mult: Math.max(...ctx.diceValues, 1) } : {}
    },
    {
        id: 'mechanic_vector', name: '枪机: 双持模组', desc: '维克托系: 基础倍率翻倍', rarity: 'EPIC', price: 90, icon: <UziIcon />,
        onCalculate: (ctx) => ['VECTOR','TWIN_FANG','AKIMBO','RICOCHET'].includes(ctx.weaponId) ? { mult: ctx.mult * 2 } : {}
    }
];

const CHIP_POOL: CyberwareDef[] = [
    {
        id: 'core_stability', name: '核心: 稳定超频', desc: '每级增加 5 基础筹码 (按等级)', rarity: 'COMMON', price: 0, icon: <Activity className="w-full h-full text-slate-300" />,
        onCalculate: (ctx) => ({ chips: ctx.chips + (ctx.level * 5) })
    },
    {
        id: 'core_hull', name: '核心: 纳米镀层', desc: '每级增加 10 最大生命 (按等级)', rarity: 'COMMON', price: 0, icon: <Heart className="w-full h-full text-green-300" />,
        onTurnStart: (state) => ({ maxPlayerHp: state.maxPlayerHp + (state.level < 2 ? 10 : 5) })
    },
    {
        id: 'core_mining', name: '核心: 算力挖矿', desc: '每回合增加 3 金币 (固定)', rarity: 'COMMON', price: 0, icon: <Database className="w-full h-full text-yellow-300" />,
        onTurnStart: (state) => ({ gold: state.gold + 3 })
    },
    {
        id: 'core_learning', name: '算法: 深度学习', desc: '每级增加 20 筹码 (按等级)', rarity: 'RARE', price: 0, icon: <Database className="w-full h-full text-cyan-400" />,
        onCalculate: (ctx) => ({ chips: ctx.chips + (ctx.level * 20) })
    },
    {
        id: 'core_shield', name: '协议: 自动偏导', desc: '每回合开始获得 [等级x3] 的护盾', rarity: 'RARE', price: 0, icon: <Shield className="w-full h-full text-blue-400" />,
        onTurnStart: (state) => ({ playerShield: state.playerShield + (state.level * 3) })
    },
    {
        id: 'core_investment', name: '协议: 复利计算', desc: '每级增加 10% 金币获取', rarity: 'RARE', price: 0, icon: <TrendingUp className="w-full h-full text-yellow-400" />,
        onTurnStart: (state) => ({ gold: Math.floor(state.gold + (state.level * 2)) })
    },
    {
        id: 'core_growth', name: '欧米茄: 过载生长', desc: '每5级增加 20% 最终倍率', rarity: 'LEGENDARY', price: 0, icon: <Cpu className="w-full h-full text-fuchsia-500" />,
        onCalculate: (ctx) => ({ mult: Math.floor(ctx.mult * (1 + (Math.floor(ctx.level / 5) * 0.2))) })
    },
    {
        id: 'core_vampire', name: '欧米茄: 血肉引擎', desc: '击杀回复 [等级x5] 生命值', rarity: 'LEGENDARY', price: 0, icon: <BiohazardIcon className="w-full h-full text-red-500" />,
        onTurnStart: (state) => ({}) 
    },
    {
        id: 'core_quant_shield', name: '欧米茄: 事件视界', desc: '每回合开始重置护盾至 50% 最大生命值', rarity: 'LEGENDARY', price: 0, icon: <ShieldIcon className="w-full h-full text-purple-500" />,
        onTurnStart: (state) => ({ playerShield: Math.floor(state.maxPlayerHp * 0.5) })
    }
];

// Static Reward Definitions for Encyclopedia and Logic
const REWARD_DEFINITIONS = [
    { id: 'hull', title: '装甲加固', desc: '最大生命 +20', rarity: 'COMMON', iconType: 'HEART' },
    { id: 'shield', title: '偏导力场', desc: '获得 30 护盾', rarity: 'COMMON', iconType: 'SHIELD' },
    { id: 'gold', title: '加密缓存', desc: '获得 50 金币', rarity: 'COMMON', iconType: 'DB' },
    { id: 'patch', title: '紧急修复', desc: '恢复 50 生命', rarity: 'COMMON', iconType: 'BATTERY' },
    { id: 'nanite_repair', title: '纳米修复群', desc: '恢复20%已损生命值', rarity: 'RARE', iconType: 'ACTIVITY' },
    { id: 'reroll', title: '义体手臂', desc: '最大重随次数 +1', rarity: 'RARE', iconType: 'REFRESH' },
    { id: 'glass_cannon', title: '玻璃大炮', desc: '聚变倍率+2, 最大生命-40', rarity: 'CORRUPTED', iconType: 'BIO' },
    { id: 'blood_money', title: '血腥金钱', desc: '获得200金币, 当前生命-30', rarity: 'CORRUPTED', iconType: 'SKULL' },
    { id: 'corrupt_data', title: '数据损坏', desc: '金币+100, 30%几率锁定色子', rarity: 'CORRUPTED', iconType: 'ALERT' },
    { id: 'unstable_core', title: '不稳定核心', desc: '吸血+50%, 每次开火自损5点', rarity: 'CORRUPTED', iconType: 'BIO' },
] as const;

const BOSS_MODIFIERS: BossModifier[] = [
    { id: 'NONE', name: '', desc: '', effectId: 'NONE' },
    { id: 'WALL', name: '防火墙', desc: '点数1失效', effectId: 'FIREWALL' },
    { id: 'GLITCH', name: '系统故障', desc: '每手-10筹码', effectId: 'GLITCH' },
    { id: 'DAMPENER', name: '抑制器', desc: '基础倍率减半', effectId: 'DAMPENER' }
];

const getRandomFace = (): DieValue => Math.ceil(Math.random() * 6) as DieValue;

const getDistinctRandomFace = (current: DieValue): DieValue => {
    let next = getRandomFace();
    if (current !== 0) {
        while (next === current) {
            next = getRandomFace();
        }
    }
    return next;
};

const generateIntent = (level: number, enemyType: string, currentDice: DieData[], phase: number = 1): EnemyIntent => {
    const isBoss = level % 5 === 0;
    let baseDmg = 10 + Math.floor(level * 2.5);
    
    if (level <= 10) baseDmg = Math.floor(baseDmg * 0.7);
    
    const activeSealedDice = currentDice.filter(d => d.sealedTurns > 0).length;
    const canSeal = activeSealedDice < 2;

    if (enemyType === 'BOSS_FINAL' && phase === 2) {
        baseDmg = Math.floor(baseDmg * 1.5);
        const rand = Math.random();
        if (rand < 0.4) return { type: 'COMBO', damage: Math.floor(baseDmg * 0.8), hits: 3, desc: '毁灭连击' };
        if (rand < 0.7) return { type: 'ATTACK', damage: Math.floor(baseDmg * 1.5), desc: '湮灭打击' };
        return { type: 'AOE_GLITCH', damage: baseDmg, desc: '全域干扰' };
    }

    if (isBoss) {
        baseDmg = Math.floor(baseDmg * 1.5); 
        const rand = Math.random();
        if (rand < 0.25) return { type: 'COMBO', damage: Math.floor(baseDmg * 0.6), hits: 3, desc: '三连击' };
        if (rand < 0.45) return { type: 'JAM_WEAPON', damage: Math.floor(baseDmg * 0.8), desc: '武器干扰' };
        if (rand < 0.65 && canSeal) return { type: 'SEAL_SLOT', damage: Math.floor(baseDmg * 1.2), desc: '骇入槽位' };
        return { type: 'ATTACK', damage: baseDmg, desc: '强力重击' };
    }

    const rand = Math.random();
    if ((enemyType === 'BOSS_3' || level >= 5) && rand < 0.20 && canSeal) return { type: 'SEAL_SLOT', damage: Math.floor(baseDmg * 1.2), desc: '骇入槽位' };
    
    if (enemyType === 'BOSS_2' && rand > 0.5) return { type: 'PIERCING', damage: Math.floor(baseDmg * 0.8), desc: '穿甲攻击' };
    if (enemyType === 'BOSS_3' && rand > 0.5) return { type: 'AOE_GLITCH', damage: Math.floor(baseDmg * 0.6), desc: '骇入' };
    
    if (rand < 0.15) return { type: 'PIERCING', damage: Math.floor(baseDmg * 0.8), desc: '穿甲攻击' };
    if (rand < 0.3) return { type: 'AOE_GLITCH', damage: Math.floor(baseDmg * 0.6), desc: '骇入' };
    
    return { type: 'ATTACK', damage: baseDmg, desc: '攻击' };
};

const getChipRarityWeights = (level: number) => {
    if (level <= 3) return { COMMON: 0.70, RARE: 0.25, LEGENDARY: 0.05 };
    if (level <= 8) return { COMMON: 0.50, RARE: 0.40, LEGENDARY: 0.10 };
    if (level <= 15) return { COMMON: 0.30, RARE: 0.50, LEGENDARY: 0.20 };
    return { COMMON: 0.10, RARE: 0.50, LEGENDARY: 0.40 };
};

const getSavedHighScore = (): number => {
    try {
        const saved = localStorage.getItem('dice_revolver_highscore');
        return saved ? parseInt(saved, 10) : 0;
    } catch (e) { return 0; }
};

const saveHighScore = (score: number) => {
    try {
        const current = getSavedHighScore();
        if (score > current) {
            localStorage.setItem('dice_revolver_highscore', score.toString());
        }
    } catch (e) {}
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    status: 'START',
    difficulty: 'ROOKIE',
    highScore: 0, 
    stats: { turnsTaken: 0, maxDamageDealt: 0, enemiesKilled: 0 },
    gold: 0,
    unlockedWeapons: [], 
    disabledWeapons: [],
    cyberware: [],
    maxCyberwareSlots: 3,
    hp: 2000,
    maxHp: 2000,
    level: 1,
    enemyType: 'BOSS_1',
    bossModifier: BOSS_MODIFIERS[0],
    enemyIntent: { type: 'ATTACK', damage: 10, desc: '攻击' },
    bossPhase: 1,
    playerHp: 200,
    maxPlayerHp: 200,
    playerShield: 0,
    lifesteal: 0,
    rerolls: MAX_REROLLS,
    maxRerolls: MAX_REROLLS,
    dice: [],
    maxDice: INITIAL_DICE_COUNT,
    turn: 1,
  });

  const [rolling, setRolling] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState<'NORMAL' | 'HEAVY'>('NORMAL');
  const [firing, setFiring] = useState(false);
  const [activeWeaponId, setActiveWeaponId] = useState<WeaponType | null>(null);
  const [screenFlash, setScreenFlash] = useState(false);
  const [enemyAttacking, setEnemyAttacking] = useState(false);
  const [enemyHit, setEnemyHit] = useState(false);
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showShop, setShowShop] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showChipSelect, setShowChipSelect] = useState(false);
  const [rewardOptions, setRewardOptions] = useState<RewardOption[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  
  // Evolution State
  const [evolutionOptions, setEvolutionOptions] = useState<{baseWeapon: WeaponType, options: WeaponDef[]} | null>(null);
  
  const [victoryModalOpen, setVictoryModalOpen] = useState(false);

  useEffect(() => {
      setGameState(prev => ({ ...prev, highScore: getSavedHighScore() }));
  }, []);

  useEffect(() => {
      if (gameState.level > gameState.highScore) {
          setGameState(prev => ({ ...prev, highScore: gameState.level }));
          saveHighScore(gameState.level);
      }
  }, [gameState.level]);

  useEffect(() => {
      if (gameState.dice.length !== gameState.maxDice) {
          setGameState(prev => {
              const current = prev.dice;
              if (prev.maxDice > current.length) {
                  const newDice = Array.from({ length: prev.maxDice - current.length }).map((_, i) => ({
                      id: Date.now() + i,
                      value: 0 as DieValue,
                      isLocked: false,
                      isRolling: false,
                      sealedTurns: 0
                  }));
                  return { ...prev, dice: [...current, ...newDice] };
              } else {
                  return { ...prev, dice: current.slice(0, prev.maxDice) };
              }
          });
      }
  }, [gameState.maxDice, gameState.dice.length]);

  useEffect(() => {
      if(damagePopups.length > 0) {
          const timer = setTimeout(() => setDamagePopups(prev => prev.slice(1)), 2500); 
          return () => clearTimeout(timer);
      }
  }, [damagePopups]);

  useEffect(() => {
      if(particles.length > 0) {
          const timer = setTimeout(() => setParticles(prev => prev.slice(5)), 1000);
          return () => clearTimeout(timer);
      }
  }, [particles]);

  useEffect(() => {
      if(screenFlash) {
          const t = setTimeout(() => setScreenFlash(false), 100);
          return () => clearTimeout(t);
      }
  }, [screenFlash]);

  const generateChipOptions = (): RewardOption[] => {
      const weights = getChipRarityWeights(gameState.level);
      
      const getWeightedRarity = () => {
          const r = Math.random();
          if (r < weights.COMMON) return 'COMMON';
          if (r < weights.COMMON + weights.RARE) return 'RARE';
          return 'LEGENDARY';
      };

      const options: RewardOption[] = [];
      const selectedIds = new Set<string>();
      
      for (let i = 0; i < 3; i++) {
          const targetRarity = getWeightedRarity();
          const pool = CHIP_POOL.filter(c => c.rarity === targetRarity && !selectedIds.has(c.id));
          const fallbackPool = CHIP_POOL.filter(c => !selectedIds.has(c.id));
          const chip = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
          
          if (chip) {
              selectedIds.add(chip.id);
              options.push({
                  id: `chip_${chip.id}_${Date.now()}_${i}`,
                  title: chip.name,
                  desc: chip.desc,
                  rarity: chip.rarity as any,
                  type: 'CYBERWARE',
                  icon: chip.icon,
                  apply: (s) => ({ ...s, cyberware: [...s.cyberware, chip] })
              });
          }
      }
      return options;
  };

  const startPlayerTurn = (state: GameState): GameState => {
      let newState = { ...state, rerolls: state.maxRerolls };
      newState.dice = newState.dice.map(d => ({
          ...d,
          sealedTurns: Math.max(0, d.sealedTurns - 1)
      }));
      newState.cyberware.forEach(cw => {
          if (cw.onTurnStart) {
              newState = { ...newState, ...cw.onTurnStart(newState) };
          }
      });
      return newState;
  };

  const initGame = (difficulty: Difficulty) => {
    soundManager.startBgm('NORMAL');
    const startHp = difficulty === 'ROOKIE' ? 200 : 50;
    let initialEnemyHp = 2000;
    initialEnemyHp = Math.floor(initialEnemyHp * 0.3); // Level 1 is now 0.3x

    // Initial 9 weapons
    const startWeapons: WeaponType[] = [
        'PEACEMAKER', 'BUCKSHOT', 'VECTOR', 'TRINITY', 'QUADRA', 
        'SINGULARITY', 'STRIKER', 'FLUX_BEAM', 'FLAMETHROWER'
    ];

    let initialState: GameState = {
      status: 'PLAYING',
      difficulty,
      highScore: getSavedHighScore(),
      hp: initialEnemyHp,
      maxHp: initialEnemyHp,
      level: 1,
      gold: 0,
      cyberware: [],
      unlockedWeapons: startWeapons,
      disabledWeapons: [],
      playerHp: startHp,
      maxPlayerHp: startHp,
      playerShield: 0,
      lifesteal: 0,
      rerolls: MAX_REROLLS,
      maxRerolls: MAX_REROLLS,
      stats: { turnsTaken: 0, maxDamageDealt: 0, enemiesKilled: 0 },
      dice: Array.from({ length: INITIAL_DICE_COUNT }).map((_, i) => ({
        id: i, value: 0, isLocked: false, isRolling: false, sealedTurns: 0
      })),
      maxDice: INITIAL_DICE_COUNT,
      bossModifier: BOSS_MODIFIERS[0],
      enemyIntent: { type: 'ATTACK', damage: 10, desc: '攻击' }, 
      bossPhase: 1,
      turn: 1,
      enemyType: 'BOSS_1',
      maxCyberwareSlots: 3
    };
    
    initialState.enemyIntent = generateIntent(1, 'BOSS_1', initialState.dice, 1);
    setGameState(initialState);
    setRewardOptions(generateChipOptions());
    setShowChipSelect(true);
  };

  const triggerShake = (intensity: 'NORMAL' | 'HEAVY' = 'NORMAL') => {
    setShakeIntensity(intensity);
    setShaking(false); 
    setTimeout(() => setShaking(true), 10);
    setTimeout(() => setShaking(false), intensity === 'HEAVY' ? 400 : 200);
  };

  const spawnParticles = (count: number, color: string, xBias: number = 0) => {
      const newParticles: Particle[] = [];
      for(let i=0; i<count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 50 + Math.random() * 200;
          newParticles.push({
              id: `p_${Date.now()}_${i}`,
              x: '50%', y: '40%',
              tx: `${Math.cos(angle) * dist + xBias}px`,
              ty: `${Math.sin(angle) * dist}px`,
              color: color
          });
      }
      setParticles(prev => [...prev, ...newParticles]);
  };

  // LEVEL 50 Ultimate Choice
  const generateUltimateRewards = (): RewardOption[] => {
      return [
          { id: 'ult_excalibur', title: '誓约·胜利之剑', desc: '究极武器: 999基础筹码 x 999倍率', rarity: 'ULTIMATE', type: 'WEAPON_UP', icon: <ExcaliburIcon className="w-full h-full text-yellow-300"/>, 
            apply: (s) => ({ ...s, unlockedWeapons: [...s.unlockedWeapons, 'EXCALIBUR'] }) },
          { id: 'ult_aegis', title: '宙斯盾防御系统', desc: '究极武器: 将防御转化为绝对火力', rarity: 'ULTIMATE', type: 'WEAPON_UP', icon: <ShieldIcon className="w-full h-full text-blue-300"/>, 
            apply: (s) => ({ ...s, unlockedWeapons: [...s.unlockedWeapons, 'AEGIS_SYSTEM'] }) },
          { id: 'ult_ragnarok', title: '诸神黄昏', desc: '究极武器: 毁灭一切的终焉', rarity: 'ULTIMATE', type: 'WEAPON_UP', icon: <Flame className="w-full h-full text-red-500"/>, 
            apply: (s) => ({ ...s, unlockedWeapons: [...s.unlockedWeapons, 'RAGNAROK'] }) }
      ];
  };

  const generateRewards = (): RewardOption[] => {
      const getIcon = (type: string) => {
          const props = { className: "w-full h-full" };
          switch(type) {
              case 'HEART': return <Heart className={props.className}/>;
              case 'SHIELD': return <Shield className={props.className}/>;
              case 'DB': return <Database className={props.className}/>;
              case 'BATTERY': return <BatteryCharging className={`${props.className} text-green-400`}/>;
              case 'ACTIVITY': return <Activity className={`${props.className} text-green-500`}/>;
              case 'REFRESH': return <RefreshCw className={`${props.className} text-cyan-400`}/>;
              case 'BIO': return <BiohazardIcon className={props.className}/>;
              case 'SKULL': return <Skull className={props.className}/>;
              case 'ALERT': return <AlertTriangle className={props.className}/>;
              default: return <Database className={props.className}/>;
          }
      };

      const pool: RewardOption[] = REWARD_DEFINITIONS.map(def => ({
          id: def.id,
          title: def.title,
          desc: def.desc,
          rarity: def.rarity,
          type: def.rarity === 'COMMON' ? 'STAT_UP' : 'MECHANIC', // Simplified typing
          icon: getIcon(def.iconType),
          apply: (s) => {
              // Map IDs to logic logic
              let ns = { ...s };
              switch(def.id) {
                  case 'hull': ns.maxPlayerHp += 20; ns.playerHp += 20; break;
                  case 'shield': ns.playerShield += 30; break;
                  case 'gold': ns.gold += 50; break;
                  case 'patch': ns.playerHp = Math.min(ns.maxPlayerHp, ns.playerHp + 50); break;
                  case 'nanite_repair': ns.playerHp = Math.floor(ns.playerHp + (ns.maxPlayerHp - ns.playerHp) * 0.2); break;
                  case 'reroll': ns.maxRerolls += 1; break;
                  case 'glass_cannon': ns.maxPlayerHp = Math.max(1, ns.maxPlayerHp - 40); ns.playerHp = Math.min(ns.playerHp, ns.maxPlayerHp); break; // Mult logic handled in calculate
                  case 'blood_money': ns.gold += 200; ns.playerHp = Math.max(1, ns.playerHp - 30); break;
                  case 'corrupt_data': ns.gold += 100; break;
                  case 'unstable_core': ns.lifesteal += 0.5; break;
              }
              return ns;
          }
      }));

      let available = pool;
      const getWeighted = () => {
          const r = Math.random();
          if (r > 0.80) return available.filter(p => p.rarity === 'CORRUPTED')[Math.floor(Math.random() * available.filter(p => p.rarity === 'CORRUPTED').length)];
          if (r > 0.60) return available.filter(p => p.rarity === 'RARE')[Math.floor(Math.random() * available.filter(p => p.rarity === 'RARE').length)];
          return available.filter(p => p.rarity === 'COMMON')[Math.floor(Math.random() * available.filter(p => p.rarity === 'COMMON').length)];
      };

      const safeGet = () => { const res = getWeighted(); return res || available[0]; };
      return [safeGet(), safeGet(), safeGet()].map((o, i) => ({...o, id: `${o.id}_${Date.now()}_${i}`}));
  };

  const calculateHandScore = (weaponId: WeaponType, diceValues: number[], unlocked: WeaponType[], cyberware: CyberwareDef[], modifier: BossModifier, gameState: GameState) => {
      const weapon = WEAPONS.find(w => w.id === weaponId);
      if(!weapon) return { chips: 0, mult: 0, total: 0 };

      let baseChips = weapon.baseChips;
      let baseMult = weapon.baseMult;
      let diceSum = diceValues.reduce((a,b) => a+b, 0);

      // --- SPECIAL MECHANICS LOGIC ---
      
      // SINGULARITY / EVENT HORIZON Base scaling
      if (weaponId === 'SINGULARITY' || weaponId === 'SUPERNOVA' || weaponId === 'EVENT_HORIZON') {
          const face = diceValues[0] || 1;
          baseMult += (face * 10);
      }
      
      // SUPERNOVA: Massive dmg on 6s
      if (weaponId === 'SUPERNOVA') {
          if (diceValues[0] === 6) baseMult *= 5;
      }
      // BLACK HOLE: Shielding
      if (weaponId === 'BLACK_HOLE') {
          // Effect happens in fire loop, visuals here
      }

      // FLUX BEAM Scaling
      if (weaponId === 'FLUX_BEAM' || weaponId === 'PRISM_BEAM') {
          baseMult += (diceValues.length * 5);
      }
      // ORBITAL CANNON: Turn Scaling
      if (weaponId === 'ORBITAL_CANNON') {
          baseMult += (gameState.turn * 10);
      }
      
      // PEACEMAKER VARIANTS
      if (weaponId === 'DESPERADO') {
          if (gameState.rerolls === 0) baseMult *= 5;
      }

      // BUCKSHOT VARIANTS
      if (weaponId === 'MIDAS_HAND') {
          baseChips += Math.floor(gameState.gold * 0.5);
      }
      if (weaponId === 'TITAN_GRIP') {
          if (diceValues.includes(6)) baseMult += 30;
      }
      if (weaponId === 'BUCKSHOT_NOVA') {
          baseChips += gameState.playerHp;
      }

      // VECTOR VARIANTS
      if (weaponId === 'AKIMBO') {
          const rerollsUsed = gameState.maxRerolls - gameState.rerolls;
          baseMult += (rerollsUsed * 3);
      }
      if (weaponId === 'RICOCHET') {
          // Check if it's effectively 4 of a kind (e.g. 4,4,4,4 counts as 2 pair of 4s)
          const distinct = new Set(diceValues).size;
          if (distinct === 1 && diceValues.length >= 4) baseMult *= 2;
      }

      // TRINITY VARIANTS
      if (weaponId === 'TRI_FORCE') {
          // Check if odd
          if (diceValues.length > 0 && diceValues[0] % 2 !== 0) baseMult *= 2;
      }

      // QUADRA VARIANTS
      if (weaponId === 'OMNI_BURST') {
           baseMult = 50 * (Math.max(1, diceValues.length - 3));
      }
      // RAILGUN handled by bypassing shield logic mostly, or just high mult

      // STRIKER VARIANTS
      if (weaponId === 'FLASH_STEP') {
          if (gameState.turn === 1) baseMult *= 3; // Simplified to turn 1
      }

      // FLAMETHROWER VARIANTS
      if (weaponId === 'MELTDOWN') {
           baseChips += gameState.playerShield;
      }
      if (weaponId === 'NAPALM') {
          const counts: Record<number,number> = {};
          diceValues.forEach(v => counts[v] = (counts[v]||0)+1);
          if (counts[6] >= 2) baseMult *= 3;
      }


      // MODIFIERS
      if (modifier.effectId === 'FIREWALL') diceSum = diceValues.reduce((a,b) => b === 1 ? a : a+b, 0);
      if (modifier.effectId === 'DAMPENER') baseMult = Math.max(1, Math.floor(baseMult / 2));
      if (modifier.effectId === 'GLITCH') baseChips = Math.max(1, baseChips - 10);

      let context = { chips: baseChips, mult: baseMult, diceSum, weaponId, diceValues, level: gameState.level, turn: gameState.turn };
      for (const item of cyberware) {
          if(item.onCalculate) {
              const updates = item.onCalculate(context);
              context = { ...context, ...updates };
          }
      }
      const total = (context.chips + context.diceSum) * context.mult;
      return { chips: context.chips, mult: context.mult, total, diceSum: context.diceSum };
  };

  // CORE TRIGGER LOGIC
  const calculateTriggeredWeapons = (diceValues: number[], unlocked: WeaponType[]) => {
      const triggered: { weapon: WeaponType, dice: number[] }[] = [];
      if (diceValues.length === 0) return triggered;

      const counts: Record<number, number> = {1:0,2:0,3:0,4:0,5:0,6:0};
      diceValues.forEach(v => { if(v>0) counts[v]++ });
      const sortedUnique = Object.keys(counts).filter(k=>counts[Number(k)]>0).map(Number).sort((a,b)=>a-b);
      
      // SEQUENCE
      let maxSeq = 0;
      let currentSeq = 0;
      let seqDice: number[] = [];
      let bestSeqDice: number[] = [];
      for (let i = 0; i < sortedUnique.length; i++) {
          if (i === 0 || sortedUnique[i] === sortedUnique[i-1] + 1) {
              currentSeq++;
              seqDice.push(sortedUnique[i]);
          } else {
              if (currentSeq > maxSeq) { maxSeq = currentSeq; bestSeqDice = [...seqDice]; }
              currentSeq = 1; seqDice = [sortedUnique[i]];
          }
      }
      if (currentSeq > maxSeq) { maxSeq = currentSeq; bestSeqDice = [...seqDice]; }

      // Helper to check if player owns a weapon of a certain trigger type
      const getWeaponForTrigger = (t: WeaponTriggerType): WeaponType | undefined => {
          // Find the weapon in unlocked that matches this trigger type
          return unlocked.find(id => WEAPONS.find(w => w.id === id)?.triggerType === t);
      };

      // FLAVOR/ULTIMATE Triggers
      const sum = diceValues.reduce((a,b)=>a+b, 0);
      unlocked.forEach(wId => {
          const w = WEAPONS.find(def => def.id === wId);
          if (w && w.triggerType === 'FLAVOR') {
              if (wId === 'DOOMSDAY' && sum >= 24) triggered.push({ weapon: wId, dice: diceValues });
              if (wId === 'PLASMA' && diceValues.every(d => d % 2 !== 0)) triggered.push({ weapon: wId, dice: diceValues });
              if (wId === 'VOID' && diceValues.every(d => d % 2 === 0)) triggered.push({ weapon: wId, dice: diceValues });
              if (wId === 'SHIV' && sum <= 11) triggered.push({ weapon: wId, dice: diceValues });
              if (['EXCALIBUR', 'AEGIS_SYSTEM', 'RAGNAROK'].includes(wId)) triggered.push({ weapon: wId, dice: diceValues });
          }
      });

      // NEW: SIX KIND (Event Horizon)
      const sixKind = Object.keys(counts).find(k => counts[Number(k)] >= 6);
      if (sixKind) {
          const w = getWeaponForTrigger('SIX_KIND');
          if (w) triggered.push({ weapon: w, dice: Array(6).fill(Number(sixKind)) });
      }

      // NEW: SUPER STRAIGHT (Prism Beam - 123456)
      if (maxSeq >= 6) {
          const w = getWeaponForTrigger('SUPER_STR');
          if (w) triggered.push({ weapon: w, dice: [1,2,3,4,5,6] });
      }

      // NEW: DOUBLE TRIPLE (Inferno - Two 3-Kinds)
      let tripleCount = 0;
      Object.values(counts).forEach(c => { if (c >= 3) tripleCount++; });
      if (tripleCount >= 2) {
          const w = getWeaponForTrigger('DOUBLE_TRIPLE');
          if (w) triggered.push({ weapon: w, dice: diceValues });
      }

      // BIG STRAIGHT
      if (maxSeq >= 5) {
          const w = getWeaponForTrigger('BIG_STR');
          if (w) triggered.push({ weapon: w, dice: diceValues.filter(d => bestSeqDice.includes(d)) });
      }
      
      // SMALL STRAIGHT
      if (maxSeq >= 4) {
          const w = getWeaponForTrigger('SMALL_STR');
          if (w) triggered.push({ weapon: w, dice: diceValues.filter(d => bestSeqDice.slice(0,4).includes(d)) });
      }

      // FIVE KIND
      const fiveKind = Object.keys(counts).find(k => counts[Number(k)] >= 5);
      if (fiveKind) {
          const w = getWeaponForTrigger('FIVE_KIND');
          if (w) triggered.push({ weapon: w, dice: Array(5).fill(Number(fiveKind)) });
      }

      // FOUR KIND (Also triggers Omni-Burst if available on 4, 5, 6)
      const omniWeapon = unlocked.find(id => id === 'OMNI_BURST');
      if (omniWeapon) {
           const any4Plus = Object.keys(counts).find(k => counts[Number(k)] >= 4);
           if (any4Plus) triggered.push({ weapon: omniWeapon, dice: diceValues });
      } else {
          const fourKind = Object.keys(counts).find(k => counts[Number(k)] >= 4);
          if (fourKind) {
              const w = getWeaponForTrigger('FOUR_KIND');
              if (w) triggered.push({ weapon: w, dice: Array(4).fill(Number(fourKind)) });
          }
      }

      // THREE KIND
      const threeKind = Object.keys(counts).find(k => counts[Number(k)] >= 3);
      if (threeKind) {
          const w = getWeaponForTrigger('THREE_KIND');
          if (w) triggered.push({ weapon: w, dice: Array(3).fill(Number(threeKind)) });
      }

      // FULL HOUSE
      let hasThree = false;
      let hasTwo = false;
      Object.keys(counts).forEach(k => {
          if (counts[Number(k)] >= 3 && !hasThree) { hasThree = true; }
          else if (counts[Number(k)] >= 2 && !hasTwo) { hasTwo = true; }
      });
      const fiveOfKindExist = Object.values(counts).some(c => c >= 5);
      if ((hasThree && hasTwo) || fiveOfKindExist) {
          const w = getWeaponForTrigger('FULL_HOUSE');
          if (w) triggered.push({ weapon: w, dice: diceValues });
      }

      // TWO PAIR
      let distinctPairs = 0;
      Object.values(counts).forEach(c => {
          if (c >= 4) distinctPairs += 2;
          else if (c >= 2) distinctPairs += 1;
      });
      if (distinctPairs >= 2) {
           const w = getWeaponForTrigger('TWO_PAIR');
           if (w) triggered.push({ weapon: w, dice: diceValues });
      }

      // PAIR
      const wPair = getWeaponForTrigger('PAIR');
      if (wPair) {
          for (let f=6; f>=1; f--) {
              const numPairs = Math.floor(counts[f] / 2);
              for (let i=0; i<numPairs; i++) {
                  triggered.push({ weapon: wPair, dice: [f, f] });
              }
          }
      }

      // SCATTER (Always)
      const wScatter = getWeaponForTrigger('SCATTER');
      if (wScatter) {
          triggered.push({ weapon: wScatter, dice: diceValues });
      }

      return triggered;
  };

  const generateShopItems = (currentState: GameState = gameState): ShopItem[] => {
     const pool: ShopItem[] = [
         { id: 'repair', type: 'CONSUMABLE', name: '紧急维修包', desc: '恢复 30 HP', cost: 15, icon: <HeartIcon className="w-6 h-6"/> },
         { id: 'shield', type: 'CONSUMABLE', name: '能量护盾', desc: '增加 15 护盾', cost: 25, icon: <ShieldIcon className="w-6 h-6"/> },
         { id: 'reroll_up', type: 'CONSUMABLE', name: '机械手臂', desc: '+1 最大重随次数', cost: 40, icon: <RefreshCw className="w-6 h-6"/> },
     ];
     const randomCyber = CYBERWARE_POOL[Math.floor(Math.random() * CYBERWARE_POOL.length)];
     if(randomCyber && currentState.cyberware.length < currentState.maxCyberwareSlots) {
         pool.push({ id: `cyber_${randomCyber.id}_${Date.now()}`, type: 'CYBERWARE', name: randomCyber.name, desc: randomCyber.desc, cost: randomCyber.price, icon: randomCyber.icon, data: randomCyber });
     }
     return pool.slice(0, 3);
  };

  const handleToggleLock = (id: number) => {
      const die = gameState.dice.find(d => d.id === id);
      if(rolling || firing || gameState.status !== 'PLAYING' || !die || die.value === 0 || die.sealedTurns > 0) return;
      setGameState(prev => ({ ...prev, dice: prev.dice.map(d => d.id === id ? { ...d, isLocked: !d.isLocked } : d) }));
  };

  const triggerRoll = useCallback((isFree: boolean = false) => {
      if (rolling || gameState.status !== 'PLAYING') return;
      if (!isFree && (firing || gameState.rerolls <= 0)) return;

      setRolling(true);
      setShaking(true);
      setShakeIntensity('NORMAL');
      if (!isFree) setGameState(prev => ({ ...prev, rerolls: prev.rerolls - 1 }));
      
      setTimeout(() => {
          setShaking(false);
          setGameState(prev => ({ 
              ...prev, 
              dice: prev.dice.map(d => d.isLocked || d.sealedTurns > 0 ? d : { ...d, value: getDistinctRandomFace(d.value) }) 
          }));
          setRolling(false);
      }, 600);
  }, [rolling, firing, gameState.status, gameState.rerolls]);

  const handleRollClick = () => triggerRoll(false);

  const executeEnemyAttack = async (damage: number, type: EnemyActionType, hits: number = 1) => {
      setEnemyAttacking(true);
      soundManager.playBossAttack();
      
      setGameState(prev => ({...prev, disabledWeapons: []}));
      const loopCount = type === 'COMBO' ? hits : 1;
      
      for (let i = 0; i < loopCount; i++) {
          await new Promise(r => setTimeout(r, 400));
          triggerShake('HEAVY');
          setScreenFlash(true);

          setGameState(prev => {
              let { playerHp, playerShield, maxRerolls, dice, maxDice, disabledWeapons, unlockedWeapons } = prev;
              let finalDamage = damage;
              if (type === 'PIERCING') { playerHp = Math.max(0, playerHp - damage); } 
              else if (type !== 'SEAL_SLOT') { 
                  if (playerShield >= damage) { playerShield -= damage; finalDamage = 0; } 
                  else { finalDamage = damage - playerShield; playerShield = 0; }
                  playerHp = Math.max(0, playerHp - finalDamage);
              }

              let nextDice = dice;
              let nextDisabled = [...disabledWeapons];

              if (i === loopCount - 1) {
                  if (type === 'SEAL_SLOT') {
                      const unsealedIndices = dice.map((d, idx) => d.sealedTurns === 0 ? idx : -1).filter(idx => idx !== -1);
                      const currentlySealed = dice.filter(d => d.sealedTurns > 0).length;
                      if (unsealedIndices.length > 0 && currentlySealed < 2) {
                          const targetIdx = unsealedIndices[Math.floor(Math.random() * unsealedIndices.length)];
                          nextDice = dice.map((d, idx) => idx === targetIdx ? { ...d, sealedTurns: 3, value: 0, isLocked: false } : d);
                      }
                  }
                  if (type === 'AOE_GLITCH') {
                      nextDice = dice.map(d => d.sealedTurns > 0 ? d : { ...d, value: 1 as DieValue, isLocked: true });
                  } else if (type !== 'SEAL_SLOT') {
                      nextDice = dice.map(d => d.sealedTurns > 0 ? d : { ...d, value: 0 as DieValue, isLocked: false });
                  }
                  if (type === 'JAM_WEAPON') {
                      const target = unlockedWeapons[Math.floor(Math.random() * unlockedWeapons.length)];
                      if (target) nextDisabled.push(target);
                  }
              }
              return { 
                  ...prev, 
                  playerHp, playerShield, maxDice, 
                  dice: nextDice, 
                  disabledWeapons: nextDisabled,
                  turn: i === loopCount - 1 ? prev.turn + 1 : prev.turn, 
                  status: playerHp <= 0 ? 'GAMEOVER' : 'PLAYING', 
                  rerolls: maxRerolls, 
                  enemyIntent: i === loopCount - 1 ? generateIntent(prev.level, prev.enemyType, nextDice, prev.bossPhase) : prev.enemyIntent 
              };
          });
          
          if (type === 'SEAL_SLOT' && i === loopCount - 1) setDamagePopups(prev => [...prev, { id: Date.now(), value: 0, x: 0, y: 0, color: '#ef4444', isCrit: true, label: '槽位封锁' }]);
          if (type === 'JAM_WEAPON' && i === loopCount - 1) setDamagePopups(prev => [...prev, { id: Date.now(), value: 0, x: 0, y: 0, color: '#94a3b8', isCrit: true, label: '被干扰' }]);
      }
      setEnemyAttacking(false);
  };

  const handleFire = async () => {
      if(rolling || firing || gameState.status !== 'PLAYING') return;
      const activeDice = gameState.dice.filter(d => d.value > 0 && d.sealedTurns === 0);
      if (activeDice.length === 0) return;

      setFiring(true);
      const diceValues = activeDice.map(d => d.value);
      let triggeredHands = calculateTriggeredWeapons(diceValues, gameState.unlockedWeapons);
      triggeredHands = triggeredHands.filter(h => !gameState.disabledWeapons.includes(h.weapon));

      let currentEnemyHp = gameState.hp;
      let roundTotalDamage = 0;

      if (triggeredHands.length > 0) {
        triggeredHands.sort((a,b) => {
            const wA = WEAPONS.find(w=>w.id===a.weapon);
            const wB = WEAPONS.find(w=>w.id===b.weapon);
            if (a.weapon === 'CHRONOS') return 1;
            if (b.weapon === 'CHRONOS') return -1;
            return (wB?.baseMult || 0) - (wA?.baseMult || 0);
        });

        for(const hand of triggeredHands) {
            if(currentEnemyHp <= 0 && (gameState.level !== 60 || gameState.bossPhase === 2)) break;
            if (gameState.level === 60 && gameState.bossPhase === 1 && currentEnemyHp <= 0) break;

            setActiveWeaponId(hand.weapon);
            let score = calculateHandScore(hand.weapon, hand.dice, gameState.unlockedWeapons, gameState.cyberware, gameState.bossModifier, gameState);
            if (hand.weapon === 'CHRONOS') { score = { ...score, total: roundTotalDamage }; }
            if (hand.weapon === 'TWIN_FANG') { score.total *= 2; } 

            // SIDE EFFECTS
            if (hand.weapon === 'BLACK_HOLE') {
                setGameState(prev => ({...prev, playerShield: prev.playerShield + 500}));
                setDamagePopups(prev => [...prev, {id: Date.now(), value: 0, x:0, y:-40, color: '#1e1b4b', isCrit: false, label: 'SHIELD +500'}]);
            }
            if (hand.weapon === 'BOUNTY_HUNTER') {
                setGameState(prev => ({...prev, gold: prev.gold + 2}));
            }
            if (hand.weapon === 'VAMPIRE_FANG') {
                const heal = Math.floor(score.total * 0.2);
                setGameState(prev => ({...prev, playerHp: Math.min(prev.maxPlayerHp, prev.playerHp + heal)}));
            }
            if (hand.weapon === 'MELTDOWN') {
                 setGameState(prev => ({...prev, playerShield: 0}));
            }
            if (hand.weapon === 'HYPER_BEAM') {
                 setGameState(prev => ({...prev, playerHp: Math.max(1, prev.playerHp - 20)}));
            }

            const weaponDef = WEAPONS.find(w => w.id === hand.weapon);
            const isCrit = score.total >= 50; 

            await new Promise(r => setTimeout(r, 200));
            let sfxType: 'KINETIC' | 'ENERGY' | 'EXPLOSIVE' | 'MELEE' = 'KINETIC';
            if(['PLASMA','VOID','FLUX_BEAM','PRISM_BEAM','EVENT_HORIZON','AEGIS_SYSTEM','RAILGUN','HYPER_BEAM'].includes(hand.weapon)) sfxType = 'ENERGY';
            if(['TRINITY','QUADRA','SINGULARITY','OMNI_BURST','RAGNAROK','SUPERNOVA','MELTDOWN'].includes(hand.weapon)) sfxType = 'EXPLOSIVE';
            if(['SHIV','TACTICAL_EXEC','EXCALIBUR','TWIN_FANG','ASSASSIN'].includes(hand.weapon)) sfxType = 'MELEE';
            soundManager.playWeaponSfx(sfxType, score.total);

            triggerShake(isCrit ? 'HEAVY' : 'NORMAL');
            if (isCrit) setScreenFlash(true);
            setEnemyHit(true);
            setTimeout(() => setEnemyHit(false), 150);
            spawnParticles(isCrit ? 20 : 8, isCrit ? '#facc15' : weaponDef?.color || '#fff', (Math.random()*100)-50);
            setDamagePopups(prev => [...prev, {
                id: Date.now() + Math.random(), value: score.total, x: (Math.random()*40)-20, y: (Math.random()*40)-20,
                color: weaponDef?.color || '#fff', isCrit, label: weaponDef?.name
            }]);

            currentEnemyHp -= score.total;
            roundTotalDamage += score.total;
            let lifestealAmount = Math.ceil(score.total * gameState.lifesteal);
            if (lifestealAmount > 0) setDamagePopups(prev => [...prev, { id: Date.now()+Math.random(), value: lifestealAmount, x: 40, y: -20, color: '#ef4444', isCrit: false, label: '吸收' }]);
            setGameState(prev => ({ 
                ...prev, hp: Math.max(0, currentEnemyHp),
                playerHp: Math.min(prev.maxPlayerHp, prev.playerHp + lifestealAmount),
                stats: { ...prev.stats, maxDamageDealt: Math.max(prev.stats.maxDamageDealt, score.total) } 
            }));
            await new Promise(r => setTimeout(r, 400)); 
        }
      }

      setActiveWeaponId(null);
      await new Promise(r => setTimeout(r, 500));
      
      if(currentEnemyHp <= 0) {
           if (gameState.level === 60 && gameState.bossPhase === 1) {
               const newHp = Math.floor(gameState.maxHp * 0.5);
               setGameState(prev => ({
                   ...prev,
                   hp: newHp,
                   maxHp: Math.floor(prev.maxHp * 0.5),
                   bossPhase: 2,
                   enemyIntent: generateIntent(60, 'BOSS_FINAL', prev.dice, 2)
               }));
               
               triggerShake('HEAVY');
               setScreenFlash(true);
               setDamagePopups(prev => [...prev, { id: Date.now(), value: 0, x: 0, y: -50, color: '#ef4444', isCrit: true, label: '系统重启: 最终协议' }]);
               
               await new Promise(r => setTimeout(r, 1000));
               const intent = generateIntent(60, 'BOSS_FINAL', gameState.dice, 2);
               await executeEnemyAttack(intent.damage, intent.type, intent.hits);
               if (gameState.playerHp > 0) {
                    setGameState(prev => startPlayerTurn(prev));
                    triggerRoll(true);
               }
               setFiring(false);
               return;
           }

           spawnParticles(50, '#facc15');
           saveHighScore(gameState.level);

           if (gameState.level === 60 && (gameState.difficulty === 'ROOKIE' || gameState.difficulty === 'CYBERPSYCH')) {
                setVictoryModalOpen(true);
                setFiring(false);
                return;
           }

           if (gameState.level % 10 === 0) {
                setGameState(prev => ({ ...prev, maxDice: Math.min(MAX_DICE_CAP, prev.maxDice + 1) }));
                setDamagePopups(prev => [...prev, { id: Date.now(), value: 0, x: 0, y: -50, color: '#facc15', isCrit: true, label: '核心扩容: 槽位+1' }]);
           }

           // WEAPON EVOLUTION LOGIC (Levels 5, 10, ... 45)
           if (gameState.level < 50 && gameState.level % 5 === 0) {
               // Find weapons that player has that are Tier 1 (have children)
               const tier1WeaponsOwned = gameState.unlockedWeapons.filter(id => {
                    // Check if this weapon ID has children in the WEAPONS list
                    const children = WEAPONS.filter(w => w.parentId === id);
                    return children.length > 0;
               });

               if (tier1WeaponsOwned.length > 0) {
                   const baseWeaponId = tier1WeaponsOwned[Math.floor(Math.random() * tier1WeaponsOwned.length)];
                   const evolutionOptions = WEAPONS.filter(w => w.parentId === baseWeaponId);
                   setEvolutionOptions({ baseWeapon: baseWeaponId, options: evolutionOptions });
                   setFiring(false); // Stop firing loop while waiting for choice? Actually handled by modal overlay
               }
           }

           setGameState(prev => ({ 
              ...prev, gold: prev.gold + 15 + Math.floor(prev.level * 5),
              stats: { ...prev.stats, enemiesKilled: prev.stats.enemiesKilled + 1 },
              dice: prev.dice.map(d => d.sealedTurns > 0 ? d : ({ ...d, value: 0 as DieValue, isLocked: false }))
          }));

          if (gameState.level === 50) {
              setRewardOptions(generateUltimateRewards());
              setShowRewards(true);
          } else {
              // Only show normal rewards if NOT evolving? Or show both?
              // The request says "5-45... will provide a basic weapon reinforcement INSTEAD OF random".
              // Assuming this replaces the usual Boss Reward logic for these levels, or maybe just the weapon part.
              // Let's assume it replaces the Reward Screen for Boss levels to focus on the weapon.
              // BUT wait, standard logic is rewards -> shop -> next.
              // Let's queue them. If Evolution triggers, we show that.
              if (!(gameState.level < 50 && gameState.level % 5 === 0)) {
                  setRewardOptions(generateRewards());
                  setShowRewards(true);
              }
          }

      } else {
          const intent = gameState.enemyIntent;
          await executeEnemyAttack(intent.damage, intent.type, intent.hits);
          if (gameState.playerHp > 0) {
              setGameState(prev => startPlayerTurn(prev));
              triggerRoll(true);
          }
      }
      setFiring(false);
  };

  const handleSelectReward = (option: RewardOption) => {
    const newState = option.apply(gameState);
    setGameState(newState);
    
    if (gameState.level % 5 === 0) {
        setRewardOptions(generateChipOptions());
        setShowRewards(false);
        setShowChipSelect(true); 
    } else {
        setShopItems(generateShopItems(newState));
        setShowRewards(false);
        setShowShop(true); 
    }
  };

  const handleEvolutionSelect = (selectedWeapon: WeaponDef) => {
      if (!evolutionOptions) return;
      
      setGameState(prev => {
          // Replace old weapon ID with new one
          const newUnlocked = prev.unlockedWeapons.map(id => id === evolutionOptions.baseWeapon ? selectedWeapon.id : id);
          return { ...prev, unlockedWeapons: newUnlocked };
      });
      
      setEvolutionOptions(null);
      
      // After Evolution, proceed to Chips -> Shop -> Next
      // Since we skipped standard rewards for this boss, we go straight to Chips
      setRewardOptions(generateChipOptions());
      setShowChipSelect(true);
  };

  const handleSelectChip = (option: RewardOption) => {
      let newState = option.apply(gameState);
      if (newState.level === 1 && newState.turn === 1) {
          newState = startPlayerTurn(newState);
      }
      setGameState(newState);
      setShowChipSelect(false);

      if (gameState.level === 1 && gameState.turn === 1) {
          setTimeout(() => triggerRoll(true), 500);
      } else {
          setShopItems(generateShopItems(newState));
          setShowShop(true);
      }
  };

  const handleReturnToMenu = () => {
      soundManager.stopBgm();
      setGameState(prev => ({
          ...prev,
          status: 'START',
          victoryModalOpen: false,
          level: 1, // Reset level so background reverts to normal
          bossPhase: 1,
          enemyType: 'BOSS_1'
      }));
  };

  const isBossLevel = gameState.level % 5 === 0;

  return (
    <div className={`h-[100dvh] w-full overflow-y-auto overflow-x-hidden bg-[#050505] text-slate-200 font-sans flex flex-col items-center custom-scrollbar ${shaking ? (shakeIntensity === 'HEAVY' ? 'animate-shake-hard' : 'animate-shake') : ''}`}>
      {screenFlash && <div className="fixed inset-0 bg-white/20 z-[60] animate-flash pointer-events-none mix-blend-overlay"></div>}
      <Background isBoss={gameState.status !== 'START' && isBossLevel} />
      
      {gameState.status === 'START' && <StartScreen onStart={initGame} highScore={gameState.highScore} onOpenEncyclopedia={() => setShowEncyclopedia(true)} />}
      
      {gameState.status === 'GAMEOVER' && <GameOver level={gameState.level} stats={gameState.stats} onRestart={handleReturnToMenu} />}
      
      <Encyclopedia 
        isOpen={showEncyclopedia} 
        onClose={() => setShowEncyclopedia(false)}
        weapons={WEAPONS}
        cyberware={CYBERWARE_POOL}
        chips={CHIP_POOL}
        rewards={REWARD_DEFINITIONS as any}
      />

      {/* Victory Modal */}
      {victoryModalOpen && (
          <div className="fixed inset-0 z-[80] overflow-y-auto custom-scrollbar bg-black/90 backdrop-blur animate-in fade-in">
              <div className="min-h-full w-full flex items-center justify-center p-4">
                <div className="bg-slate-900 border-2 border-yellow-500 p-8 rounded-xl text-center flex flex-col items-center max-w-lg mx-4 shadow-[0_0_50px_#eab308]">
                    <Crown className="w-20 h-20 text-yellow-400 mb-6 animate-pulse" />
                    <h2 className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 mb-4">MISSION ACCOMPLISHED</h2>
                    <p className="text-slate-300 font-mono mb-8 text-lg">最终威胁已清除。系统核心安全。</p>
                    
                    <div className="flex gap-4">
                            <button 
                                onClick={handleReturnToMenu} 
                                className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded border border-slate-500"
                            >
                                返回主菜单
                            </button>
                    </div>
                </div>
              </div>
          </div>
      )}

      {/* Evolution Selection Modal */}
      {evolutionOptions && (
          <div className="fixed inset-0 z-[75] overflow-y-auto custom-scrollbar bg-black/90 backdrop-blur animate-in fade-in">
              <div className="min-h-full w-full flex items-center justify-center p-4">
                <div className="w-full max-w-4xl flex flex-col items-center my-auto">
                    <Zap className="w-16 h-16 text-cyan-400 mb-4 animate-pulse" />
                    <h2 className="text-3xl md:text-4xl font-black italic text-white mb-2 text-center">武器核心过载</h2>
                    <p className="text-cyan-400 font-mono mb-8 text-center tracking-widest">检测到可进化组件，请选择升级路线</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        {evolutionOptions.options.map(opt => (
                            <button 
                                    key={opt.id}
                                    onClick={() => handleEvolutionSelect(opt)}
                                    className="relative bg-slate-800 border-2 border-slate-600 hover:border-cyan-400 hover:bg-slate-700 hover:-translate-y-2 transition-all duration-300 p-6 rounded-xl group flex flex-col items-center text-center"
                            >
                                <div className="w-20 h-20 mb-4 text-cyan-400 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform">
                                    {/* Placeholder Icon, assumes WeaponCard logic handles mapping based on ID */}
                                    <Crosshair className="w-full h-full" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-2">{opt.name}</h3>
                                <div className="text-xs font-mono text-cyan-500 mb-4 bg-black/40 px-2 py-1 rounded">{opt.req}</div>
                                <p className="text-sm text-slate-400 leading-relaxed">{opt.description}</p>
                                <div className="mt-auto pt-6">
                                    <span className="inline-block px-4 py-2 bg-cyan-900 text-cyan-200 rounded font-bold text-sm group-hover:bg-cyan-500 group-hover:text-black transition-colors">选择</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
              </div>
          </div>
      )}

      {showChipSelect && <RewardModal headerTitle="选择核心协议" options={rewardOptions} onSelect={handleSelectChip} />}
      {showRewards && <RewardModal options={rewardOptions} onSelect={handleSelectReward} />}
      
      {showShop && <ShopModal items={shopItems} gold={gameState.gold} 
        onBuy={(item) => {
            if(gameState.gold >= item.cost) {
                setGameState(prev => {
                    let ns = { ...prev, gold: prev.gold - item.cost };
                    if(item.type === 'CYBERWARE') ns.cyberware = [...ns.cyberware, item.data];
                    if(item.id === 'repair') ns.playerHp = Math.min(ns.maxPlayerHp, ns.playerHp + 30);
                    if(item.id === 'shield') ns.playerShield = Math.min(100, ns.playerShield + 15);
                    if(item.id === 'reroll_up') ns.maxRerolls += 1;
                    return ns;
                });
                setShopItems(prev => prev.filter(i => i.id !== item.id));
            }
        }} 
        onNextLevel={() => {
            setShowShop(false);
            const nextLevel = gameState.level + 1;
            const isBoss = nextLevel % 5 === 0;
            
            soundManager.setBgmMode(isBoss ? 'BOSS' : 'NORMAL');
            const nextBossModifier = isBoss ? BOSS_MODIFIERS[Math.floor(Math.random() * (BOSS_MODIFIERS.length - 1)) + 1] : (nextLevel % 3 === 0 ? BOSS_MODIFIERS[Math.floor(Math.random() * BOSS_MODIFIERS.length)] : BOSS_MODIFIERS[0]);
            
            const bossTypes = ['BOSS_1', 'BOSS_2', 'BOSS_3', 'BOSS_4', 'BOSS_5'];
            let nextType = '';
            if (nextLevel === 60) {
                nextType = 'BOSS_FINAL';
            } else {
                nextType = isBoss ? bossTypes[Math.floor(Math.random() * bossTypes.length)] : bossTypes[nextLevel % bossTypes.length];
            }

            const baseGrowth = (200 + (nextLevel * 60)) * 10; 
            const hpMultiplier = nextType === 'BOSS_FINAL' ? 15 : (isBoss ? 6 : 4);
            
            let hpScale = 1.0;
            
            if (nextLevel <= 5) {
                hpScale = 0.3;
            } else if (nextLevel <= 10) {
                hpScale = 0.7;
            } else if (nextLevel < 16) {
                hpScale = 1.0;
            } else {
                if (gameState.difficulty === 'ROOKIE') {
                     if (nextLevel >= 46) hpScale = 10;
                     else if (nextLevel >= 31) hpScale = 6;
                     else hpScale = 3;
                } else {
                     // CYBERPSYCH or ENDLESS
                     if (gameState.difficulty === 'ENDLESS' && nextLevel > 60) {
                         const x = Math.ceil((nextLevel - 60) / 10);
                         hpScale = 60 * x;
                     } else {
                         if (nextLevel >= 46) hpScale = 20;
                         else if (nextLevel >= 31) hpScale = 12;
                         else hpScale = 6;
                     }
                }
            }
            
            const nextHp = Math.floor(baseGrowth * hpMultiplier * hpScale);

            setGameState(prev => {
                const s = {
                    ...prev, level: nextLevel,
                    hp: nextHp, maxHp: nextHp,
                    bossModifier: nextBossModifier,
                    enemyType: nextType, enemyIntent: generateIntent(nextLevel, nextType, prev.dice, 1),
                    bossPhase: 1,
                    dice: prev.dice.map(d => ({ ...d, isLocked: false, value: 0 as DieValue })),
                    tacticalMission: undefined
                };
                return startPlayerTurn(s); 
            });
            setTimeout(() => triggerRoll(true), 100); 
        }} />}

      {gameState.status !== 'START' && (
        <div className="relative z-10 w-[95%] max-w-7xl min-h-full flex flex-col animate-in fade-in duration-700">
            <div className="flex-none z-30 mt-2">
                <BattleHUD 
                    level={gameState.level}
                    gold={gameState.gold}
                    cyberware={gameState.cyberware}
                    maxCyberwareSlots={gameState.maxCyberwareSlots}
                    playerHp={gameState.playerHp}
                    maxPlayerHp={gameState.maxPlayerHp}
                    playerShield={gameState.playerShield}
                    enemyHp={gameState.hp}
                    maxEnemyHp={gameState.maxHp}
                    enemyName={gameState.enemyType}
                    enemyIntent={gameState.enemyIntent}
                    bossModifier={gameState.bossModifier}
                    isBoss={isBossLevel}
                />
            </div>

            <div className="flex-1 flex flex-col relative bg-gradient-to-b from-slate-900/10 to-transparent mx-0 sm:mx-2 my-1 rounded-xl overflow-visible min-h-[400px]">
                <DamageFeedback items={damagePopups} />
                <VfxLayer particles={particles} />
                
                <div className="flex-[1.5] flex items-center justify-center relative min-h-0 pt-4 pb-4">
                    <Enemy hp={gameState.hp} maxHp={gameState.maxHp} typeId={gameState.enemyType} isHit={enemyHit} modifier={gameState.bossModifier} intent={gameState.enemyIntent} />
                </div>
                
                <div className={`flex-1 flex items-start justify-center bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 ${enemyAttacking && gameState.enemyIntent.type === 'AOE_GLITCH' ? 'animate-glitch-anim' : ''}`}>
                    <div className={`relative flex flex-wrap justify-center gap-2 sm:gap-4 p-2 transition-transform duration-100 ${shaking ? 'blur-sm scale-95' : 'scale-100'}`}>
                        {gameState.dice.map(d => (
                            <Die key={d.id} data={d} toggleLock={handleToggleLock} disabled={rolling || firing || d.value === 0} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-none flex flex-col gap-1 p-2 pb-6 sm:pb-8 bg-slate-950/90 backdrop-blur border-t border-white/10 z-30">
                <div className="flex gap-3 overflow-x-auto pb-4 pt-2 scrollbar-hide mask-linear-fade px-4 min-h-[150px] items-end">
                    {WEAPONS.filter(w => gameState.unlockedWeapons.includes(w.id)).map(w => (
                        <WeaponCard 
                            key={w.id} 
                            weapon={w} 
                            isActive={true} 
                            isFiring={activeWeaponId === w.id} 
                            isDisabled={gameState.disabledWeapons.includes(w.id)}
                            level={gameState.level}
                        />
                    ))}
                </div>
                <Controls onRoll={handleRollClick} onFire={handleFire} rerolls={gameState.rerolls} maxRerolls={gameState.maxRerolls} isRolling={rolling} isFiring={firing} />
            </div>
        </div>
      )}
    </div>
  );
}
