const { useState, useEffect, useCallback, useRef, useMemo } = React;

/**
 * TREASURE DIG - Professional Hot/Cold Treasure Hunting
 *
 * Design Principles Applied:
 * - Pattern Learning (Koster): Distance numbers enable triangulation/deduction
 * - Flow State (Csikszentmihalyi): Balanced challenge, clear feedback, sense of control
 * - Four Keys (Lazzaro): Hard Fun (fiero), Easy Fun (exploration), Serious Fun (progression)
 * - Agency (SDT): Tools, meaningful choices, skill-based gameplay
 * - Essential Experience: The "aha!" moment of deductive treasure finding
 */

const TreasureDig = () => {
    // ============================================
    // JRPG-STYLE THEME - Bioluminescent Swamp Explorer
    // Materials: brass, dark leather, mossy enamel, glass
    // ============================================
    const theme = {
        // Core backgrounds - deep, moody swamp
        bg: '#0f0d0a', bgPanel: '#1a1714', bgDark: '#0a0908',
        bgFrame: '#161412', bgFrameInner: '#1e1b18',

        // Ornate frame colors - brass & moss
        frameBrass: '#8b7355', frameBrassLight: '#a89070',
        frameBrassDark: '#5a4a38', frameMoss: '#3a4a32',
        frameGlow: 'rgba(139, 115, 85, 0.3)',

        // Borders - leather & enamel
        border: '#3a3228', borderLight: '#4a4238',
        borderGold: '#8b7355', borderAccent: '#5a6a4a',

        // Text hierarchy
        text: '#f0e8d8', textSecondary: '#b8a888', textMuted: '#706858',
        textBright: '#fff8e8',

        // Mode-specific accent colors
        modeScan: '#2dd4bf', modeScanGlow: 'rgba(45, 212, 191, 0.4)',
        modeMark: '#f59e0b', modeMarkGlow: 'rgba(245, 158, 11, 0.4)',
        modeDig: '#ef4444', modeDigGlow: 'rgba(239, 68, 68, 0.4)',
        modeHint: '#a78bfa', modeHintGlow: 'rgba(167, 139, 250, 0.4)',

        // Legacy accent (gold theme)
        accent: '#daa520', accentBright: '#f4c542',
        gold: '#f4c542', goldGlow: 'rgba(218, 165, 32, 0.4)',

        // Feedback colors
        error: '#ef4444', success: '#22c55e',
        hot: '#ff2222', warm: '#ff8844', lukewarm: '#ddaa44',
        cool: '#44aadd', cold: '#4466ff', frozen: '#8888ff',
        treasure: '#ffd700', gem: '#44ffaa', decoy: '#ff4488',

        // Signal strength colors
        signalStrong: '#ef4444', signalMedium: '#f59e0b',
        signalWeak: '#22c55e', signalNone: '#4a4a4a'
    };

    // Mode configuration for JRPG command menu styling
    const modeConfig = {
        scan: {
            name: 'SCAN', icon: '📡', color: theme.modeScan, glow: theme.modeScanGlow,
            cursor: 'crosshair', description: 'Detect signal strength'
        },
        mark: {
            name: 'MARK', icon: '🎯', color: theme.modeMark, glow: theme.modeMarkGlow,
            cursor: 'cell', description: 'Mark tiles for digging'
        },
        dig: {
            name: 'DIG', icon: '⛏️', color: theme.modeDig, glow: theme.modeDigGlow,
            cursor: 'pointer', description: 'Excavate marked tiles'
        },
        hint: {
            name: 'HINT', icon: '💡', color: theme.modeHint, glow: theme.modeHintGlow,
            cursor: 'help', description: 'Reveal a clue'
        }
    };

    // Get current mode color based on game phase
    const getCurrentModeColor = (phase) => {
        switch(phase) {
            case 'prospect': return theme.modeScan;
            case 'dig': return theme.modeDig;
            default: return theme.accent;
        }
    };

    // ============================================
    // JRPG UI COMPONENTS
    // ============================================

    // Ornate Frame - wraps the board with JRPG-style decorative border
    const OrnateFrame = ({ children, modeColor, title, subtitle }) => (
        <div style={{
            position: 'relative',
            padding: '8px',
            background: `linear-gradient(135deg, ${theme.frameBrassDark} 0%, ${theme.frameBrass} 50%, ${theme.frameBrassDark} 100%)`,
            borderRadius: '12px',
            boxShadow: `
                0 0 0 2px ${theme.frameBrassLight},
                0 0 0 4px ${theme.bgDark},
                0 0 20px ${theme.frameGlow},
                inset 0 1px 0 ${theme.frameBrassLight}
            `
        }}>
            {/* Corner decorations */}
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => (
                <div key={corner} style={{
                    position: 'absolute',
                    width: '20px', height: '20px',
                    [corner.includes('top') ? 'top' : 'bottom']: '-2px',
                    [corner.includes('left') ? 'left' : 'right']: '-2px',
                    background: theme.frameBrassLight,
                    borderRadius: corner.includes('top-left') || corner.includes('bottom-right') ? '8px 0' : '0 8px',
                    boxShadow: `0 0 8px ${theme.frameGlow}`
                }} />
            ))}
            {/* Title bar with mode info */}
            {title && (
                <div style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: theme.bgDark,
                    padding: '4px 20px',
                    borderRadius: '10px',
                    border: `2px solid ${modeColor || theme.frameBrass}`,
                    fontSize: '11px',
                    color: modeColor || theme.text,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    whiteSpace: 'nowrap',
                    boxShadow: modeColor ? `0 0 10px ${modeColor}40` : 'none'
                }}>
                    {title}
                    {subtitle && <span style={{ color: theme.textMuted, marginLeft: '8px', fontWeight: 'normal' }}>{subtitle}</span>}
                </div>
            )}
            {/* Inner frame */}
            <div style={{
                background: theme.bgFrameInner,
                borderRadius: '8px',
                border: `2px solid ${theme.frameBrassDark}`,
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)'
            }}>
                {children}
            </div>
        </div>
    );

    // Status Column - left side resource display
    const StatusColumn = ({ digs, score, treasuresFound, treasureCount, combo, friends, objective, modeColor, phase }) => (
        <div style={{
            width: '160px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }}>
            {/* JRPG-style stat windows */}
            <div style={{
                background: `linear-gradient(180deg, ${theme.bgPanel} 0%, ${theme.bgDark} 100%)`,
                border: `2px solid ${theme.frameBrass}`,
                borderRadius: '8px',
                padding: '12px',
                boxShadow: `0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 ${theme.borderLight}`
            }}>
                {/* Scans/Digs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{phase === 'prospect' ? '📡' : '⛏️'}</span>
                    <div>
                        <div style={{
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: digs <= 1 ? theme.error : (phase === 'prospect' ? theme.modeScan : theme.text),
                            lineHeight: 1,
                            textShadow: digs <= 1 ? `0 0 10px ${theme.error}` : 'none'
                        }}>{digs}</div>
                        <div style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase' }}>
                            {phase === 'prospect' ? 'Scans' : 'Digs'}
                        </div>
                    </div>
                </div>
                {/* Coins */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px' }}>💰</span>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.gold, lineHeight: 1 }}>{score}</div>
                        <div style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase' }}>Coins</div>
                    </div>
                </div>
                {/* Gems/Treasures */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>💎</span>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.success, lineHeight: 1 }}>
                            {treasuresFound}<span style={{ fontSize: '14px', color: theme.textMuted }}>/{treasureCount}</span>
                        </div>
                        <div style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase' }}>Treasure</div>
                    </div>
                </div>
            </div>

            {/* Combo display */}
            {combo >= 2 && (
                <div style={{
                    background: `linear-gradient(135deg, ${theme.hot} 0%, ${theme.warm} 100%)`,
                    border: '2px solid #ffaa44',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    textAlign: 'center',
                    animation: 'pulse 0.5s infinite'
                }}>
                    <div style={{ fontSize: '10px', color: '#fff', textTransform: 'uppercase' }}>Combo</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>🔥 {combo}x</div>
                </div>
            )}

            {/* Friends found */}
            {friends > 0 && (
                <div style={{
                    background: `linear-gradient(135deg, ${theme.success}40 0%, ${theme.bgPanel} 100%)`,
                    border: `2px solid ${theme.success}`,
                    borderRadius: '8px',
                    padding: '8px 12px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '10px', color: theme.success, textTransform: 'uppercase' }}>Friends</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: theme.success }}>🐾 {friends}</div>
                </div>
            )}

            {/* Objective window */}
            {objective && (
                <div style={{
                    background: `linear-gradient(180deg, ${theme.bgPanel} 0%, ${theme.bgDark} 100%)`,
                    border: `2px solid ${theme.gold}40`,
                    borderRadius: '8px',
                    padding: '10px',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                }}>
                    <div style={{ fontSize: '10px', color: theme.gold, textTransform: 'uppercase', marginBottom: '4px' }}>
                        ⭐ Bonus
                    </div>
                    <div style={{ fontSize: '11px', color: theme.textSecondary, lineHeight: 1.3 }}>
                        {objective}
                    </div>
                </div>
            )}
        </div>
    );

    // Command Menu - JRPG-style mode buttons
    const CommandMenu = ({ activeMode, onModeClick, scansLeft, markedCount, digsLeft, phase }) => {
        const modes = [
            { key: 'scan', ...modeConfig.scan, count: scansLeft, show: phase === 'prospect' },
            { key: 'mark', ...modeConfig.mark, count: markedCount, show: phase === 'prospect' },
            { key: 'dig', ...modeConfig.dig, count: digsLeft, show: phase === 'dig' },
            { key: 'hint', ...modeConfig.hint, count: null, show: true }
        ].filter(m => m.show);

        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                background: `linear-gradient(180deg, ${theme.bgPanel} 0%, ${theme.bgDark} 100%)`,
                border: `2px solid ${theme.frameBrass}`,
                borderRadius: '8px',
                padding: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
            }}>
                <div style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase', marginBottom: '4px', textAlign: 'center' }}>
                    Commands
                </div>
                {modes.map(mode => (
                    <button
                        key={mode.key}
                        onClick={() => onModeClick(mode.key)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 14px',
                            background: activeMode === mode.key
                                ? `linear-gradient(90deg, ${mode.color}30 0%, ${mode.color}10 100%)`
                                : 'transparent',
                            border: `2px solid ${activeMode === mode.key ? mode.color : theme.border}`,
                            borderRadius: '6px',
                            color: activeMode === mode.key ? mode.color : theme.text,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            boxShadow: activeMode === mode.key ? `0 0 12px ${mode.glow}` : 'none'
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>{mode.icon}</span>
                        <span style={{ fontWeight: 'bold', fontSize: '13px', flex: 1, textAlign: 'left' }}>{mode.name}</span>
                        {mode.count !== null && (
                            <span style={{
                                background: theme.bgDark,
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: mode.count <= 2 ? theme.error : theme.textSecondary
                            }}>
                                {mode.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        );
    };

    // Bag Panel - inventory display
    const BagPanel = ({ items, capacity, onItemClick }) => (
        <div style={{
            background: `linear-gradient(180deg, ${theme.bgPanel} 0%, ${theme.bgDark} 100%)`,
            border: `2px solid ${theme.frameBrass}`,
            borderRadius: '8px',
            padding: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
            }}>
                <span style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase' }}>Bag</span>
                <span style={{
                    fontSize: '11px',
                    color: items.length >= capacity ? theme.error : theme.textSecondary,
                    fontWeight: 'bold'
                }}>
                    {items.length}/{capacity}
                </span>
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '4px',
                minHeight: '80px'
            }}>
                {Array.from({ length: capacity }).map((_, i) => {
                    const item = items[i];
                    return (
                        <div
                            key={i}
                            onClick={() => item && onItemClick?.(item)}
                            style={{
                                aspectRatio: '1',
                                background: item ? (item.isDirt ? '#5a4030' : theme.bgFrameInner) : theme.bgDark,
                                border: `1px solid ${item ? theme.borderLight : theme.border}`,
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                cursor: item ? 'pointer' : 'default',
                                transition: 'all 0.15s'
                            }}
                        >
                            {item?.displayEmoji || item?.emoji || ''}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // Event Log - recent events display
    const EventLog = ({ events }) => (
        <div style={{
            background: `linear-gradient(180deg, ${theme.bgPanel} 0%, ${theme.bgDark} 100%)`,
            border: `2px solid ${theme.frameBrass}`,
            borderRadius: '8px',
            padding: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            maxHeight: '120px',
            overflow: 'hidden'
        }}>
            <div style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase', marginBottom: '6px' }}>
                Log
            </div>
            <div style={{ fontSize: '11px' }}>
                {events.slice(-5).reverse().map((event, i) => (
                    <div
                        key={i}
                        style={{
                            color: i === 0 ? theme.text : theme.textMuted,
                            opacity: 1 - (i * 0.15),
                            marginBottom: '3px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        {event}
                    </div>
                ))}
                {events.length === 0 && (
                    <div style={{ color: theme.textMuted, fontStyle: 'italic' }}>No events yet...</div>
                )}
            </div>
        </div>
    );

    // Context Legend - collapsible bottom help
    const ContextLegend = ({ phase, expanded, onToggle, scanTheme }) => {
        const legends = {
            prospect: [
                { icon: scanTheme?.strong?.emoji || '📡', label: 'Strong signal (treasure OR junk!)', color: theme.signalStrong },
                { icon: scanTheme?.medium?.emoji || '📶', label: 'Medium signal', color: theme.signalMedium },
                { icon: scanTheme?.weak?.emoji || '〰️', label: 'Weak signal', color: theme.signalWeak },
                { icon: '⛏️', label: 'Marked for digging', color: theme.modeMark }
            ],
            dig: [
                { icon: '🟤', label: 'Dirt clump (mystery!)', color: '#8B4513' },
                { icon: '✨', label: 'Visible item', color: theme.gold },
                { icon: '∅', label: 'Nothing here', color: theme.textMuted }
            ]
        };

        const currentLegend = legends[phase] || legends.prospect;

        return (
            <div style={{
                background: theme.bgPanel,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'all 0.2s'
            }}>
                <button
                    onClick={onToggle}
                    style={{
                        width: '100%',
                        padding: '8px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: theme.textMuted,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '11px'
                    }}
                >
                    {expanded ? '▼' : '▶'} {expanded ? 'Hide' : 'Show'} Legend
                </button>
                {expanded && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '20px',
                        padding: '8px 16px',
                        flexWrap: 'wrap',
                        borderTop: `1px solid ${theme.border}`
                    }}>
                        {currentLegend.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                                <span style={{ fontSize: '11px', color: theme.textSecondary }}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Frog Mascot - reacts to game events
    const FrogMascot = ({ mood, lastEvent }) => {
        const moods = {
            idle: { emoji: '🐸', animation: 'none' },
            happy: { emoji: '😊', animation: 'bounce 0.5s' },
            excited: { emoji: '🤩', animation: 'bounce 0.3s infinite' },
            treasure: { emoji: '🤑', animation: 'bounce 0.4s 3' },
            junk: { emoji: '😒', animation: 'shake 0.3s' },
            thinking: { emoji: '🤔', animation: 'none' },
            blink: { emoji: '😌', animation: 'none' }
        };

        const current = moods[mood] || moods.idle;

        return (
            <div style={{
                position: 'relative',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <span style={{
                    fontSize: '36px',
                    animation: current.animation,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}>
                    🐸
                </span>
                {/* Speech bubble for events */}
                {lastEvent && (
                    <div style={{
                        position: 'absolute',
                        top: '-20px',
                        left: '40px',
                        background: theme.bgPanel,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        padding: '4px 8px',
                        fontSize: '10px',
                        color: theme.text,
                        whiteSpace: 'nowrap',
                        animation: 'fadeIn 0.2s'
                    }}>
                        {lastEvent}
                    </div>
                )}
            </div>
        );
    };

    // Phase Banner - compact phase indicator
    const PhaseBanner = ({ phase, modeColor, message, stats }) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 16px',
            background: `linear-gradient(90deg, ${modeColor}20 0%, transparent 50%, ${modeColor}20 100%)`,
            border: `1px solid ${modeColor}40`,
            borderRadius: '20px',
            marginBottom: '8px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: modeColor,
                    textTransform: 'uppercase'
                }}>
                    {phase}
                </span>
                {message && (
                    <span style={{ fontSize: '11px', color: theme.textSecondary }}>
                        {message}
                    </span>
                )}
            </div>
            {stats && (
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                    {stats.map((stat, i) => (
                        <span key={i} style={{ color: theme.textSecondary }}>
                            {stat.icon} <strong style={{ color: stat.color || theme.text }}>{stat.value}</strong>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );

    // Mechanic Panel - displays world-specific mechanic status
    const MechanicPanel = ({ worldId, mechanicState, onToggleScanMode }) => {
        const mechanic = worldMechanics[worldId] || worldMechanics[0];
        if (!mechanic) return null;

        // Don't show panel for tutorial world (Funky Frog has passive triangulation)
        if (worldId === 0 && !mechanicState.triangulationScans?.length) return null;

        const renderMechanicContent = () => {
            switch (mechanic.primaryMechanic) {
                case 'triangulation':
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px' }}>📐</span>
                            <span style={{ color: theme.textSecondary, fontSize: '11px' }}>
                                {mechanicState.triangulationScans?.length || 0} scans triangulated
                            </span>
                        </div>
                    );

                case 'peckMeter':
                    const peckPct = ((mechanicState.peckMeter || 0) / (mechanicState.peckThreshold || 3)) * 100;
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <span style={{ fontSize: '14px' }}>🐔</span>
                            <div style={{ flex: 1, height: '8px', background: theme.bgDark, borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${peckPct}%`,
                                    height: '100%',
                                    background: peckPct >= 66 ? '#ef4444' : peckPct >= 33 ? '#f59e0b' : '#22c55e',
                                    transition: 'width 0.3s, background 0.3s'
                                }} />
                            </div>
                            <span style={{ color: theme.textMuted, fontSize: '10px', minWidth: '40px' }}>
                                {mechanicState.peckMeter || 0}/{mechanicState.peckThreshold || 3}
                            </span>
                        </div>
                    );

                case 'dualFrequency':
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                                onClick={() => onToggleScanMode?.('A')}
                                style={{
                                    padding: '4px 12px',
                                    background: mechanicState.scanMode === 'A' ? mechanic.mechanicRules?.scanModeA?.color : 'transparent',
                                    border: `2px solid ${mechanic.mechanicRules?.scanModeA?.color || '#06b6d4'}`,
                                    borderRadius: '4px',
                                    color: mechanicState.scanMode === 'A' ? '#000' : mechanic.mechanicRules?.scanModeA?.color,
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {mechanic.mechanicRules?.scanModeA?.name || 'Mode A'}
                            </button>
                            <button
                                onClick={() => onToggleScanMode?.('B')}
                                style={{
                                    padding: '4px 12px',
                                    background: mechanicState.scanMode === 'B' ? mechanic.mechanicRules?.scanModeB?.color : 'transparent',
                                    border: `2px solid ${mechanic.mechanicRules?.scanModeB?.color || '#d946ef'}`,
                                    borderRadius: '4px',
                                    color: mechanicState.scanMode === 'B' ? '#000' : mechanic.mechanicRules?.scanModeB?.color,
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {mechanic.mechanicRules?.scanModeB?.name || 'Mode B'}
                            </button>
                            <span style={{ color: theme.textMuted, fontSize: '10px' }}>
                                🦖 {mechanicState.roarCounter || 0}/{mechanic.mechanicRules?.roarInterval || 4}
                            </span>
                        </div>
                    );

                case 'chargeSystem':
                    const chargePct = ((mechanicState.chargeLevel || 0) / (mechanicState.maxCharge || 5)) * 100;
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <span style={{ fontSize: '14px' }}>⚡</span>
                            <div style={{ flex: 1, display: 'flex', gap: '2px' }}>
                                {Array.from({ length: mechanicState.maxCharge || 5 }).map((_, i) => (
                                    <div key={i} style={{
                                        width: '16px', height: '20px',
                                        background: i < (mechanicState.chargeLevel || 0) ? '#38bdf8' : theme.bgDark,
                                        borderRadius: '2px',
                                        border: `1px solid ${i < (mechanicState.chargeLevel || 0) ? '#0ea5e9' : theme.border}`,
                                        boxShadow: i < (mechanicState.chargeLevel || 0) ? '0 0 6px #38bdf8' : 'none'
                                    }} />
                                ))}
                            </div>
                            <span style={{ color: theme.textMuted, fontSize: '10px' }}>CHARGE</span>
                        </div>
                    );

                case 'fogOfWar':
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px' }}>🌫️</span>
                            <span style={{ color: theme.textSecondary, fontSize: '11px' }}>
                                {mechanicState.fogTiles?.length || 0} tiles fogged
                            </span>
                            {mechanicState.lanternActive && (
                                <span style={{ color: '#fcd34d', fontSize: '11px' }}>🏮 Lantern active!</span>
                            )}
                        </div>
                    );

                case 'momentum':
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '14px' }}>❄️</span>
                                <span style={{
                                    color: (mechanicState.coldTimer || 15) <= 5 ? '#ef4444' : theme.textSecondary,
                                    fontSize: '11px',
                                    fontWeight: (mechanicState.coldTimer || 15) <= 5 ? 'bold' : 'normal'
                                }}>
                                    {mechanicState.coldTimer || 15} turns
                                </span>
                            </div>
                            {(mechanicState.iceCracks?.length || 0) > 0 && (
                                <span style={{ color: '#7dd3fc', fontSize: '11px' }}>
                                    🧊 {mechanicState.iceCracks?.length} cracks
                                </span>
                            )}
                        </div>
                    );

                case 'shifting':
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px' }}>🐍</span>
                            <span style={{ color: theme.textSecondary, fontSize: '11px' }}>
                                Shift in {(mechanic.mechanicRules?.shiftInterval || 3) - (mechanicState.shiftCounter || 0)} actions
                            </span>
                            {(mechanicState.anchorTiles?.length || 0) > 0 && (
                                <span style={{ color: '#fbbf24', fontSize: '10px' }}>
                                    📍 {mechanicState.anchorTiles?.length} anchors
                                </span>
                            )}
                        </div>
                    );

                case 'depthLayers':
                    const deepCount = Object.values(mechanicState.tileDepths || {}).filter(d => d > 1).length;
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px' }}>🐺</span>
                            <span style={{ color: theme.textSecondary, fontSize: '11px' }}>
                                {deepCount} tiles need double dig
                            </span>
                        </div>
                    );

                case 'combined':
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '14px' }}>👑</span>
                            <span style={{ color: '#fcd34d', fontSize: '11px', fontWeight: 'bold' }}>
                                ULTIMATE CHALLENGE
                            </span>
                            <span style={{ color: theme.textMuted, fontSize: '10px' }}>
                                All mechanics active
                            </span>
                        </div>
                    );

                default:
                    return null;
            }
        };

        const content = renderMechanicContent();
        if (!content) return null;

        return (
            <div style={{
                background: `linear-gradient(135deg, ${mechanic.uiTheme?.accentColors?.scan || theme.modeScan}15, transparent)`,
                border: `1px solid ${mechanic.uiTheme?.accentColors?.scan || theme.modeScan}30`,
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '8px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                }}>
                    <span style={{
                        fontSize: '10px',
                        color: mechanic.uiTheme?.accentColors?.scan || theme.modeScan,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {mechanic.name}
                    </span>
                </div>
                {content}
                {mechanic.description && (
                    <div style={{
                        fontSize: '9px',
                        color: theme.textMuted,
                        marginTop: '4px',
                        fontStyle: 'italic'
                    }}>
                        {mechanic.description}
                    </div>
                )}
            </div>
        );
    };

    // Mechanic Alert Popup - shows mechanic-triggered events
    const MechanicAlertPopup = ({ alert }) => {
        if (!alert) return null;

        const bgColor = alert.type === 'error' ? 'rgba(239, 68, 68, 0.9)'
            : alert.type === 'warning' ? 'rgba(245, 158, 11, 0.9)'
            : 'rgba(34, 197, 94, 0.9)';

        return (
            <div style={{
                position: 'fixed',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                background: bgColor,
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                zIndex: 1000,
                animation: 'popIn 0.3s ease-out'
            }}>
                {alert.message}
            </div>
        );
    };

    // World themes - visual and gameplay elements for each world
    const worldThemes = {
        0: { // Frog - Swamp
            name: 'Murky Swamp',
            tileBase: '#4a5a3a', tileDug: '#3a4a2a', tileAccent: '#2a5a6a',
            tileSpecial: '#2a6a7a', specialBorder: '#4a8a9a',
            bgGradient: ['#1a2a1a', '#2a3a2a', '#1a3a3a'],
            bgPattern: 'swamp',
            specialTile: 'water', specialEmoji: '💧', specialName: 'Water Lily',
            specialDesc: 'Dig adjacent tiles first to drain',
            ambientEmojis: ['🌿', '🪷', '🐸', '🦟'],
            variation: { early: 'Shallow Pond', late: 'Deep Swamp', lateMultiplier: 1.5 }
        },
        1: { // Chicken - Farm
            name: 'Sunny Farm',
            tileBase: '#9b8365', tileDug: '#7b6345', tileAccent: '#c9b277',
            tileSpecial: '#d4a030', specialBorder: '#e8b840',
            bgGradient: ['#2a2515', '#3a3520', '#4a4025'],
            bgPattern: 'farm',
            specialTile: 'nest', specialEmoji: '🥚', specialName: 'Hidden Nest',
            specialDesc: 'Eggs give +25 points or +1 dig',
            ambientEmojis: ['🌾', '🌻', '🐔', '🌽'],
            variation: { early: 'Daytime Fields', late: 'Sunset Barn', lateMultiplier: 1.3 }
        },
        2: { // Dinosaur - Prehistoric
            name: 'Prehistoric Jungle',
            tileBase: '#6a5a4a', tileDug: '#4a3a2a', tileAccent: '#7a6a5a',
            tileSpecial: '#a08a6a', specialBorder: '#c0a080',
            bgGradient: ['#1a2015', '#2a3020', '#3a2a1a'],
            bgPattern: 'jungle',
            specialTile: 'fossil', specialEmoji: '🦴', specialName: 'Ancient Fossil',
            specialDesc: 'Shows distance to ALL treasures',
            ambientEmojis: ['🌴', '🦕', '🌋', '🥚'],
            variation: { early: 'Fern Valley', late: 'Volcanic Ridge', lateMultiplier: 1.4 }
        },
        3: { // Raccoon - Urban
            name: 'Urban Night',
            tileBase: '#4a4a55', tileDug: '#3a3a45', tileAccent: '#5a5a65',
            tileSpecial: '#f0e068', specialBorder: '#ffee88',
            bgGradient: ['#15151a', '#1a1a22', '#202028'],
            bgPattern: 'urban',
            specialTile: 'spotlight', specialEmoji: '💡', specialName: 'Street Light',
            specialDesc: 'Reveals 3x3 area permanently',
            ambientEmojis: ['🏙️', '🗑️', '🦝', '🚗'],
            variation: { early: 'Back Alley', late: 'Underground', lateMultiplier: 1.5 }
        },
        4: { // Eel - Underwater
            name: 'Ocean Depths',
            tileBase: '#3a5a6a', tileDug: '#2a4a5a', tileAccent: '#4a6a7a',
            tileSpecial: '#5090b0', specialBorder: '#60a0c0',
            bgGradient: ['#0a1a2a', '#1a2a3a', '#0a2a4a'],
            bgPattern: 'underwater',
            specialTile: 'current', specialEmoji: '🌊', specialName: 'Ocean Current',
            specialDesc: 'Shifts items in arrow direction',
            ambientEmojis: ['🐠', '🪸', '🫧', '🦑'],
            variation: { early: 'Coral Reef', late: 'Abyssal Depths', lateMultiplier: 1.6 }
        },
        5: { // Moth - Forest
            name: 'Enchanted Forest',
            tileBase: '#4a5040', tileDug: '#3a4030', tileAccent: '#5a6050',
            tileSpecial: '#70b070', specialBorder: '#90d090',
            bgGradient: ['#151a15', '#1a2018', '#18221a'],
            bgPattern: 'forest',
            specialTile: 'firefly', specialEmoji: '✨', specialName: 'Firefly Swarm',
            specialDesc: 'Reveals random nearby tiles briefly',
            ambientEmojis: ['🍄', '🦋', '🌙', '🦉'],
            variation: { early: 'Twilight Grove', late: 'Midnight Hollow', lateMultiplier: 1.4 }
        },
        6: { // Penguin - Arctic
            name: 'Frozen Tundra',
            tileBase: '#8aa8c0', tileDug: '#6a88a0', tileAccent: '#9ab8d0',
            tileSpecial: '#b0e0f0', specialBorder: '#c0f0ff',
            bgGradient: ['#1a2530', '#202a38', '#283040'],
            bgPattern: 'arctic',
            specialTile: 'slide', specialEmoji: '⛷️', specialName: 'Ice Slide',
            specialDesc: 'Dig slides to next tile automatically',
            ambientEmojis: ['❄️', '🐧', '🏔️', '🌨️'],
            variation: { early: 'Ice Shelf', late: 'Crystal Cavern', lateMultiplier: 1.3 }
        },
        7: { // Snake - Desert
            name: 'Desert Temple',
            tileBase: '#c8a870', tileDug: '#a8884a', tileAccent: '#d8b880',
            tileSpecial: '#e0c060', specialBorder: '#f0d070',
            bgGradient: ['#2a2015', '#3a3020', '#4a3a25'],
            bgPattern: 'desert',
            specialTile: 'quicksand', specialEmoji: '⏳', specialName: 'Quicksand',
            specialDesc: 'Wastes dig - no information gained',
            ambientEmojis: ['🏜️', '🐍', '🏛️', '🦂'],
            variation: { early: 'Sandy Dunes', late: 'Ancient Temple', lateMultiplier: 1.5 }
        },
        8: { // Wolf - Cave
            name: 'Crystal Cave',
            tileBase: '#5a5a6a', tileDug: '#4a4a5a', tileAccent: '#6a6a7a',
            tileSpecial: '#8080c0', specialBorder: '#a0a0e0',
            bgGradient: ['#12121a', '#1a1a25', '#151520'],
            bgPattern: 'cave',
            specialTile: 'echo', specialEmoji: '🔊', specialName: 'Echo Crystal',
            specialDesc: 'Reveals if treasure in row OR column',
            ambientEmojis: ['💎', '🐺', '🦇', '🕯️'],
            variation: { early: 'Cave Entrance', late: 'Deep Cavern', lateMultiplier: 1.4 }
        },
        9: { // Grizzly - Vault
            name: 'Royal Vault',
            tileBase: '#7a6a50', tileDug: '#5a4a30', tileAccent: '#8a7a60',
            tileSpecial: '#d4af37', specialBorder: '#f4cf57',
            bgGradient: ['#1a1510', '#2a2015', '#35281a'],
            bgPattern: 'vault',
            specialTile: 'mirror', specialEmoji: '🪞', specialName: 'Magic Mirror',
            specialDesc: 'Dig reflects to opposite side too',
            ambientEmojis: ['👑', '💰', '🏆', '💎'],
            variation: { early: 'Outer Vault', late: 'Inner Sanctum', lateMultiplier: 1.2 }
        }
    };

    // WORLD-THEMED SCANNING TOOLS - Each world has unique detection flavor
    const worldScanThemes = {
        0: { // Swamp
            tool: 'Bubble Detector', toolEmoji: '🫧',
            strong: { emoji: '🫧', label: 'BUBBLES RISING!', color: '#44ddaa' },
            medium: { emoji: '💧', label: 'Ripples...', color: '#44aa88' },
            weak: { emoji: '〰️', label: 'Tiny bubbles', color: '#448866' },
            none: { emoji: '🌿', label: 'Still water', color: '#446644' }
        },
        1: { // Farm
            tool: 'Chicken Helper', toolEmoji: '🐔',
            strong: { emoji: '🐔', label: 'CLUCKING WILDLY!', color: '#ffaa00' },
            medium: { emoji: '🐣', label: 'Scratching...', color: '#ddaa44' },
            weak: { emoji: '🥚', label: 'Pecking around', color: '#aa8844' },
            none: { emoji: '🌾', label: 'Nothing here', color: '#886644' }
        },
        2: { // Prehistoric
            tool: 'Dino Sense', toolEmoji: '🦕',
            strong: { emoji: '🦖', label: 'GROUND SHAKING!', color: '#ff6644' },
            medium: { emoji: '🦴', label: 'Vibrations...', color: '#dd8844' },
            weak: { emoji: '🪨', label: 'Faint tremor', color: '#aa7744' },
            none: { emoji: '🌴', label: 'Silence', color: '#668844' }
        },
        3: { // Urban
            tool: 'Metal Detector', toolEmoji: '📡',
            strong: { emoji: '📡', label: 'BEEPING CRAZY!', color: '#ff4444' },
            medium: { emoji: '📶', label: 'Strong beep', color: '#ffaa00' },
            weak: { emoji: '📻', label: 'Faint signal', color: '#44aa44' },
            none: { emoji: '🔇', label: 'Silent', color: '#666666' }
        },
        4: { // Underwater
            tool: 'Sonar Ping', toolEmoji: '🔊',
            strong: { emoji: '🔊', label: 'PING PING PING!', color: '#44ddff' },
            medium: { emoji: '🔉', label: 'Echo return', color: '#44aadd' },
            weak: { emoji: '🔈', label: 'Faint echo', color: '#4488aa' },
            none: { emoji: '🫧', label: 'Nothing', color: '#446688' }
        },
        5: { // Forest
            tool: 'Firefly Guide', toolEmoji: '✨',
            strong: { emoji: '✨', label: 'GLOWING BRIGHT!', color: '#ffff44' },
            medium: { emoji: '🌟', label: 'Flickering...', color: '#dddd44' },
            weak: { emoji: '💫', label: 'Dim glow', color: '#aaaa44' },
            none: { emoji: '🌙', label: 'Dark', color: '#666644' }
        },
        6: { // Arctic
            tool: 'Ice Radar', toolEmoji: '❄️',
            strong: { emoji: '🧊', label: 'COLD SPIKE!', color: '#44ddff' },
            medium: { emoji: '❄️', label: 'Chilly...', color: '#44aadd' },
            weak: { emoji: '🌨️', label: 'Cool breeze', color: '#4488aa' },
            none: { emoji: '☁️', label: 'Nothing', color: '#666688' }
        },
        7: { // Desert
            tool: 'Dowsing Rod', toolEmoji: '🪄',
            strong: { emoji: '🪄', label: 'PULLING HARD!', color: '#ffaa44' },
            medium: { emoji: '〽️', label: 'Twitching...', color: '#ddaa44' },
            weak: { emoji: '➰', label: 'Slight pull', color: '#aa8844' },
            none: { emoji: '🏜️', label: 'Nothing', color: '#886644' }
        },
        8: { // Cave
            tool: 'Echo Crystal', toolEmoji: '💎',
            strong: { emoji: '💎', label: 'RESONATING!', color: '#aa44ff' },
            medium: { emoji: '🔮', label: 'Humming...', color: '#8844dd' },
            weak: { emoji: '💠', label: 'Faint tone', color: '#6644aa' },
            none: { emoji: '🕯️', label: 'Silent', color: '#444466' }
        },
        9: { // Vault
            tool: 'Treasure Sense', toolEmoji: '👑',
            strong: { emoji: '👑', label: 'GOLDEN GLOW!', color: '#ffdd00' },
            medium: { emoji: '💰', label: 'Shimmering...', color: '#ddaa00' },
            weak: { emoji: '✨', label: 'Faint sparkle', color: '#aa8800' },
            none: { emoji: '🪙', label: 'Nothing', color: '#665500' }
        }
    };

    // ============================================
    // WORLD MECHANICS SYSTEM
    // Each world gets: 1 primary mechanic, 1 resource pressure, UI theme
    // ============================================
    const worldMechanics = {
        0: { // Funky Frog - Murky Swamp
            name: 'Signal Drift',
            description: 'Readings are noisy - scan from different angles for better accuracy',
            primaryMechanic: 'triangulation', // Multiple scans improve accuracy
            resourcePressure: null, // Tutorial world - no pressure
            uiTheme: {
                frameMaterial: 'moss-brass', // Brass with moss accents
                accentColors: { scan: '#2dd4bf', mark: '#84cc16', dig: '#22c55e' },
                particles: 'bubbles', // Rising bubbles
                glowStyle: 'bioluminescent'
            },
            mechanicRules: {
                signalNoise: 0.3, // Base noise in readings
                triangulationBonus: true, // Adjacent scans reduce noise
                adjacentScanBoost: 0.5 // 50% accuracy boost from adjacent scans
            }
        },
        1: { // Cheeky Chicken - Sunny Farm
            name: 'Peck Meter',
            description: 'Scanning startles chickens - decoys may move!',
            primaryMechanic: 'peckMeter', // Scans add to peck meter, triggers decoy movement
            resourcePressure: 'decoyMovement',
            uiTheme: {
                frameMaterial: 'wood-warm', // Warm wooden frames
                accentColors: { scan: '#fbbf24', mark: '#f97316', dig: '#dc2626' },
                particles: 'feathers', // Feather puffs on dig
                glowStyle: 'sunny'
            },
            mechanicRules: {
                peckThreshold: 3, // After 3 scans, decoys may move
                eggClusterBonus: true, // Adjacent scans reveal nest patterns
                shinyDoubleValue: true // Gems worth 2x in basket
            }
        },
        2: { // Disco Dinosaur - Prehistoric Jungle
            name: 'Dual Frequency',
            description: 'Two treasure types - toggle between scan modes A and B!',
            primaryMechanic: 'dualFrequency', // Two scan modes for two treasure types
            resourcePressure: 'roarEvent',
            uiTheme: {
                frameMaterial: 'neon-jungle', // Glowing vines
                accentColors: { scan: '#06b6d4', mark: '#d946ef', dig: '#f43f5e' },
                particles: 'synth-pulse', // Synth wave pulses
                glowStyle: 'neon'
            },
            mechanicRules: {
                scanModeA: { color: '#06b6d4', name: 'Teal Pulse' },
                scanModeB: { color: '#d946ef', name: 'Magenta Pulse' },
                roarInterval: 4, // Every 4 scans, weak signals reshuffle
                footprintTrails: true // Some tiles show directional hints
            }
        },
        3: { // Radical Raccoon - Urban Night
            name: 'Decoy AI',
            description: 'Decoys cluster where you look - read behavior, not raw signals!',
            primaryMechanic: 'decoyAI', // Decoys move toward scanned areas
            resourcePressure: 'pickpocket',
            uiTheme: {
                frameMaterial: 'crt-metal', // CRT monitor style
                accentColors: { scan: '#a3e635', mark: '#facc15', dig: '#f87171' },
                particles: 'scanlines', // CRT scanlines
                glowStyle: 'streetlight'
            },
            mechanicRules: {
                decoyAttraction: 0.7, // 70% chance decoys move toward scans
                streetlightSweep: true, // Line-of-sight mechanic
                pickpocketPenalty: 10, // Lose coins when hitting decoy
                gloveProtection: true // Glove item prevents pickpocket
            }
        },
        4: { // Electric Eel - Ocean Depths
            name: 'Charge Management',
            description: 'Scanning costs charge - dig near strong signals to recharge!',
            primaryMechanic: 'chargeSystem', // Battery gauge for scans
            resourcePressure: 'shockRisk',
            uiTheme: {
                frameMaterial: 'glass-aqua', // Glass with water effects
                accentColors: { scan: '#38bdf8', mark: '#22d3ee', dig: '#0ea5e9' },
                particles: 'bubbles-caustic', // Bubbles with caustic lighting
                glowStyle: 'oscilloscope'
            },
            mechanicRules: {
                maxCharge: 5,
                scanCost: 1,
                rechargeOnStrongDig: 2, // Recharge 2 when digging strong signal
                currentFlowBend: true, // Sonar cone bends with currents
                shockStunTurns: 1 // Skip 1 turn if shocked
            }
        },
        5: { // Mysterious Moth - Enchanted Forest
            name: 'Fog of War',
            description: 'Tiles hidden until scanned - some re-fog over time!',
            primaryMechanic: 'fogOfWar', // Hidden tiles, lantern items
            resourcePressure: 'illusions',
            uiTheme: {
                frameMaterial: 'parchment-mystic', // Old parchment with runes
                accentColors: { scan: '#c084fc', mark: '#e879f9', dig: '#a855f7' },
                particles: 'moth-flutter', // Drifting moths
                glowStyle: 'ethereal'
            },
            mechanicRules: {
                fogRefreshTurns: 5, // Tiles re-fog after 5 turns
                lanternRadius: 2, // Lantern reveals 2-tile radius permanently
                illusionChance: 0.2 // 20% chance weak signals appear strong
            }
        },
        6: { // Professor Penguin - Frozen Tundra
            name: 'Momentum',
            description: 'Actions have momentum - digs slide, repeated scans crack ice!',
            primaryMechanic: 'momentum', // Sliding digs, ice cracking
            resourcePressure: 'coldTimer',
            uiTheme: {
                frameMaterial: 'ice-glass', // Frosted glass panels
                accentColors: { scan: '#7dd3fc', mark: '#67e8f9', dig: '#06b6d4' },
                particles: 'snowflakes', // Gentle snowfall
                glowStyle: 'frost'
            },
            mechanicRules: {
                slideDistance: 1, // Slide 1 tile after dig
                crackThreshold: 2, // 2 adjacent scans crack ice
                crackReveals: 'line', // Crack reveals entire line
                coldTimerTurns: 15, // Lose dig if >15 turns
                iceCreakSound: true
            }
        },
        7: { // Sly Snake - Desert Temple
            name: 'Shifting Rooms',
            description: 'The temple shifts! Rows and columns rotate periodically.',
            primaryMechanic: 'shifting', // Board rotation
            resourcePressure: 'trapDoors',
            uiTheme: {
                frameMaterial: 'sandstone-gold', // Sandstone with gold runes
                accentColors: { scan: '#fbbf24', mark: '#f59e0b', dig: '#d97706' },
                particles: 'sand-drift', // Drifting sand particles
                glowStyle: 'rune'
            },
            mechanicRules: {
                shiftInterval: 3, // Shift every 3 actions
                shiftType: 'rotate', // Rotate rows/columns
                anchorTiles: true, // Some tiles are fixed (hieroglyphs)
                trapDoorChance: 0.1 // 10% chance wrong dig opens pit
            }
        },
        8: { // Wolf Warrior - Crystal Caves
            name: 'Deep Dig',
            description: 'Two layers to dig - clear rubble first, then extract treasure!',
            primaryMechanic: 'depthLayers', // Two-layer digging
            resourcePressure: 'echoPatterns',
            uiTheme: {
                frameMaterial: 'crystal-dark', // Dark crystal with refractions
                accentColors: { scan: '#a78bfa', mark: '#c084fc', dig: '#8b5cf6' },
                particles: 'crystal-sparkle', // Prismatic sparkles
                glowStyle: 'prismatic'
            },
            mechanicRules: {
                layerCount: 2, // 2 layers to dig
                echoScanBounce: true, // Scans bounce off walls
                crystalResonance: true, // Crystals amplify weak signals
                resonanceRadius: 2
            }
        },
        9: { // Grand Master Grizzly - Royal Vault
            name: 'Ultimate Challenge',
            description: 'Master all mechanics - limited scans, shifting rooms, deep digs!',
            primaryMechanic: 'combined', // Multiple mechanics active
            resourcePressure: 'strict',
            uiTheme: {
                frameMaterial: 'gilded-ornate', // Gilded frames with filigree
                accentColors: { scan: '#fcd34d', mark: '#fbbf24', dig: '#f59e0b' },
                particles: 'golden-dust', // Golden particles
                glowStyle: 'royal'
            },
            mechanicRules: {
                activeMechanics: ['dualFrequency', 'shifting', 'depthLayers'],
                shiftInterval: 3,
                layerCount: 2,
                strictCapacity: true, // Reduced basket capacity
                rankSystem: true, // S/A/B rank at end
                fullRevealAnimation: true // Full JRPG item card reveal
            }
        }
    };

    // Get world mechanic config for current opponent
    const getWorldMechanic = (opponentId) => worldMechanics[opponentId] || worldMechanics[0];

    // FUN distance feedback - "Treasure Sense" reactions!
    const getDistanceInfo = (distance, gridSize) => {
        if (distance === 0) return { color: '#ffd700', label: 'JACKPOT!', emoji: '🎯', tier: 0 };
        if (distance <= 1.5) return { color: '#ff2222', label: 'RIGHT HERE!', emoji: '⚡', tier: 1 };
        if (distance <= 2.5) return { color: '#ff5500', label: 'SO CLOSE!', emoji: '💥', tier: 2 };
        if (distance <= 3.5) return { color: '#ff8800', label: 'Almost!', emoji: '✨', tier: 3 };
        if (distance <= 5) return { color: '#ddaa00', label: 'Getting there', emoji: '👀', tier: 4 };
        if (distance <= 7) return { color: '#88aa44', label: 'Hmm...', emoji: '🤔', tier: 5 };
        if (distance <= 9) return { color: '#5588bb', label: 'Nope', emoji: '😐', tier: 6 };
        if (distance <= 12) return { color: '#4466aa', label: 'Nothing', emoji: '🚶', tier: 7 };
        return { color: '#555577', label: 'Way off', emoji: '💤', tier: 8 };
    };

    // COLLECTIBLES SYSTEM - Fun items to find beyond just treasure!
    const collectibleTypes = {
        // Common finds - themed to world
        coin: { emoji: '🪙', name: 'Coin', points: 10, rarity: 'common' },
        bottlecap: { emoji: '🧢', name: 'Bottle Cap', points: 5, rarity: 'common', trackTotal: true },
        shell: { emoji: '🐚', name: 'Shell', points: 8, rarity: 'common' },
        leaf: { emoji: '🍂', name: 'Leaf', points: 5, rarity: 'common' },

        // Food items - fun and silly
        hotdog: { emoji: '🌭', name: 'Hot Dog', points: 15, rarity: 'uncommon' },
        pizza: { emoji: '🍕', name: 'Pizza Slice', points: 15, rarity: 'uncommon' },
        donut: { emoji: '🍩', name: 'Donut', points: 12, rarity: 'uncommon' },
        burger: { emoji: '🍔', name: 'Burger', points: 18, rarity: 'uncommon' },
        icecream: { emoji: '🍦', name: 'Ice Cream', points: 12, rarity: 'uncommon' },

        // Critters - little friends!
        bug: { emoji: '🐛', name: 'Bug Buddy', points: 8, rarity: 'common', effect: 'friend' },
        frog: { emoji: '🐸', name: 'Frog Friend', points: 12, rarity: 'uncommon', effect: 'friend' },
        snail: { emoji: '🐌', name: 'Snail Pal', points: 10, rarity: 'common', effect: 'friend' },
        butterfly: { emoji: '🦋', name: 'Butterfly', points: 15, rarity: 'uncommon', effect: 'friend' },
        ladybug: { emoji: '🐞', name: 'Ladybug', points: 12, rarity: 'uncommon', effect: 'friend' },
        worm: { emoji: '🪱', name: 'Worm Buddy', points: 6, rarity: 'common', effect: 'friend' },

        // Shiny things
        gem: { emoji: '💎', name: 'Gem', points: 25, rarity: 'rare' },
        crystal: { emoji: '🔮', name: 'Crystal', points: 30, rarity: 'rare' },
        star: { emoji: '⭐', name: 'Star', points: 20, rarity: 'rare' },
        ring: { emoji: '💍', name: 'Ring', points: 35, rarity: 'rare' },

        // Silly/random
        sock: { emoji: '🧦', name: 'Lost Sock', points: 3, rarity: 'common' },
        key: { emoji: '🔑', name: 'Mystery Key', points: 15, rarity: 'uncommon' },
        bone: { emoji: '🦴', name: 'Bone', points: 8, rarity: 'common' },
        mushroom: { emoji: '🍄', name: 'Mushroom', points: 10, rarity: 'common' },
        acorn: { emoji: '🌰', name: 'Acorn', points: 6, rarity: 'common' },
        feather: { emoji: '🪶', name: 'Feather', points: 7, rarity: 'common' },
    };

    // World-specific collectible pools
    const worldCollectibles = {
        0: ['coin', 'frog', 'snail', 'leaf', 'mushroom', 'worm'], // Swamp
        1: ['coin', 'hotdog', 'donut', 'bug', 'acorn', 'feather'], // Farm
        2: ['bone', 'crystal', 'shell', 'gem', 'frog', 'leaf'], // Prehistoric
        3: ['bottlecap', 'pizza', 'burger', 'sock', 'key', 'coin'], // Urban
        4: ['shell', 'gem', 'crystal', 'star', 'coin', 'ring'], // Underwater
        5: ['butterfly', 'mushroom', 'gem', 'ladybug', 'leaf', 'crystal'], // Forest
        6: ['icecream', 'gem', 'crystal', 'coin', 'star', 'shell'], // Arctic
        7: ['bone', 'gem', 'ring', 'key', 'coin', 'crystal'], // Desert
        8: ['crystal', 'gem', 'star', 'coin', 'ring', 'bone'], // Cave
        9: ['gem', 'ring', 'crystal', 'star', 'coin', 'key'], // Vault
    };

    // JUNK ITEMS - look like treasure (dirt clump) but aren't!
    const junkTypes = {
        rock: { emoji: '🪨', name: 'Just a Rock', points: 1 },
        stick: { emoji: '🪵', name: 'Old Stick', points: 1 },
        nail: { emoji: '📍', name: 'Rusty Nail', points: 2 },
        can: { emoji: '🥫', name: 'Empty Can', points: 2 },
        boot: { emoji: '🥾', name: 'Old Boot', points: 3 },
        tire: { emoji: '⭕', name: 'Flat Tire', points: 2 },
    };

    // COMBINATION RECIPES - items that combine into something better!
    const combinations = {
        // Keys unlock things
        'key+lockbox': { result: 'unlockedBox', emoji: '🎁', name: 'Unlocked Treasure Box!', points: 100, reveal: true },
        'key+chest': { result: 'unlockedChest', emoji: '👑', name: 'Royal Treasure!', points: 150, reveal: true },

        // Food combos
        'bread+cheese': { result: 'sandwich', emoji: '🥪', name: 'Sandwich', points: 30 },
        'bread+hotdog': { result: 'hotdogBun', emoji: '🌭', name: 'Hot Dog Deluxe', points: 35 },
        'cone+icecream': { result: 'icecreamCone', emoji: '🍦', name: 'Ice Cream Cone', points: 25 },

        // Matching pairs
        'sock+sock': { result: 'sockPair', emoji: '🧦', name: 'Matching Socks!', points: 20, needsTwo: true },
        'bone+bone': { result: 'skeleton', emoji: '💀', name: 'Mini Skeleton', points: 40, needsTwo: true },
        'shell+shell': { result: 'necklace', emoji: '📿', name: 'Shell Necklace', points: 35, needsTwo: true },

        // Gem crafting
        'ring+gem': { result: 'jewelRing', emoji: '💍', name: 'Jeweled Ring', points: 75 },
        'ring+crystal': { result: 'magicRing', emoji: '🔮', name: 'Magic Ring', points: 80 },
        'gem+gem': { result: 'gemCluster', emoji: '💎', name: 'Gem Cluster', points: 60, needsTwo: true },
        'crystal+crystal': { result: 'geode', emoji: '🪨', name: 'Giant Geode', points: 70, needsTwo: true },

        // Critter friends
        'bug+leaf': { result: 'bugHome', emoji: '🏠', name: 'Bug Home', points: 25 },
        'worm+mushroom': { result: 'garden', emoji: '🌱', name: 'Mini Garden', points: 30 },
        'frog+snail': { result: 'pondFriends', emoji: '🐸', name: 'Pond Pals', points: 35 },

        // Map pieces
        'mapHalf+mapHalf': { result: 'fullMap', emoji: '🗺️', name: 'Treasure Map!', points: 50, needsTwo: true, effect: 'revealTreasure' },

        // Fossils
        'bone+fossil': { result: 'dinosaur', emoji: '🦕', name: 'Dino Discovery!', points: 100 },

        // Star power
        'star+star': { result: 'constellation', emoji: '✨', name: 'Constellation', points: 50, needsTwo: true },
        'star+coin': { result: 'luckyCoin', emoji: '🌟', name: 'Lucky Coin', points: 40 },

        // Tool crafting
        'battery+flashlight': { result: 'workingLight', emoji: '🔦', name: 'Working Flashlight', points: 30, effect: 'extraScan' },
        'gear+gear': { result: 'robot', emoji: '🤖', name: 'Mini Robot!', points: 80, needsTwo: true },
    };

    // Additional combinable items (not in regular collectibles)
    const specialItems = {
        lockbox: { emoji: '📦', name: 'Locked Box', points: 10, isDirtClump: true },
        chest: { emoji: '🧰', name: 'Locked Chest', points: 15, isDirtClump: true },
        mapHalf: { emoji: '🗺️', name: 'Map Piece', points: 15, isDirtClump: false },
        fossil: { emoji: '🦴', name: 'Fossil Fragment', points: 12, isDirtClump: true },
        battery: { emoji: '🔋', name: 'Battery', points: 5, isDirtClump: false },
        flashlight: { emoji: '🔦', name: 'Dead Flashlight', points: 5, isDirtClump: false },
        gear: { emoji: '⚙️', name: 'Gear', points: 8, isDirtClump: false },
        cone: { emoji: '🍦', name: 'Empty Cone', points: 3, isDirtClump: false },
        bread: { emoji: '🍞', name: 'Bread', points: 5, isDirtClump: false },
        cheese: { emoji: '🧀', name: 'Cheese', points: 5, isDirtClump: false },
    };

    // Opponents with progressive mechanics - each teaches new patterns
    // Each world has a unique environment with themed special tiles
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Friendly Guide',
            mechanic: 'Learn triangulation basics in the murky swamp!',
            description: '💧 Water Lilies block your path - dig nearby tiles first to drain them!',
            gridSize: 6, baseDigs: 12, treasures: 1, decoys: 0,
            tools: { radar: 1, flag: 5 },
            special: [], tutorial: true
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Gem Collector',
            mechanic: 'Explore the sunny farm for hidden treasures!',
            description: '🥚 Hidden Nests contain bonus eggs - extra points or digs await!',
            gridSize: 7, baseDigs: 14, treasures: 1, decoys: 0,
            tools: { radar: 1, flag: 5 },
            special: ['gems']
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Dual Digger',
            mechanic: 'Two treasures hidden in the prehistoric jungle!',
            description: '🦴 Ancient Fossils reveal distance to ALL treasures at once!',
            gridSize: 8, baseDigs: 16, treasures: 2, decoys: 0,
            tools: { radar: 2, flag: 6, xray: 1 },
            special: ['multi']
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Trickster',
            mechanic: 'Navigate the urban night - watch for decoys!',
            description: '💡 Street Lights illuminate 3x3 areas permanently when dug!',
            gridSize: 8, baseDigs: 15, treasures: 1, decoys: 2,
            tools: { radar: 1, flag: 6, xray: 2 },
            special: ['decoys']
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Scanner',
            mechanic: 'Dive into the ocean depths with sonar!',
            description: '🌊 Ocean Currents shift treasures and decoys each turn!',
            gridSize: 9, baseDigs: 14, treasures: 1, decoys: 1,
            tools: { radar: 2, flag: 6, xray: 1, sonar: 2 },
            special: ['sonar', 'decoys']
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Shadow Seeker',
            mechanic: 'The enchanted forest hides in magical fog!',
            description: '✨ Firefly Swarms briefly reveal distances of nearby tiles!',
            gridSize: 9, baseDigs: 16, treasures: 2, decoys: 1,
            tools: { radar: 2, flag: 10, xray: 2, lantern: 2 },
            special: ['fog', 'decoys']
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Ice Scholar',
            mechanic: 'Traverse the frozen tundra carefully!',
            description: '⛷️ Ice Slides cause chain reactions - dig one, slide to another!',
            gridSize: 10, baseDigs: 18, treasures: 2, decoys: 2,
            tools: { radar: 2, flag: 8, xray: 2, pickaxe: 2 },
            special: ['frozen', 'decoys', 'gems']
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Shifty One',
            mechanic: 'The desert temple holds shifting secrets!',
            description: '⏳ Quicksand tiles waste your dig - no information revealed!',
            gridSize: 10, baseDigs: 18, treasures: 1, decoys: 2,
            tools: { radar: 3, flag: 8, xray: 2, tracker: 1 },
            special: ['moving', 'decoys']
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Deep Digger',
            mechanic: 'Explore the crystal cave depths!',
            description: '🔊 Echo Crystals reveal if treasure is in the same row or column!',
            gridSize: 11, baseDigs: 20, treasures: 2, decoys: 2,
            tools: { radar: 2, flag: 8, xray: 2, drill: 2 },
            special: ['deep', 'decoys', 'gems']
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Challenge',
            mechanic: 'The royal vault - master all mechanics!',
            description: '🪞 Magic Mirrors reflect your dig to the opposite side of the grid!',
            gridSize: 12, baseDigs: 22, treasures: 3, decoys: 3,
            tools: { radar: 3, flag: 12, xray: 3, sonar: 2, drill: 2 },
            special: ['deep', 'decoys', 'gems', 'frozen', 'moving']
        }
    ];

    // Level configurations - carefully tuned difficulty curve
    // Key principle: World N Level 10 should be easier than World N+1 Level 1
    // Each level within a world gets progressively harder
    // Each world introduces new mechanics at baseline difficulty, then increases
    const getLevelConfig = (opponent, level) => {
        // Smoother scaling: grid grows more slowly, digs decrease more gradually
        const gridGrowth = Math.floor((level - 1) / 4); // +1 grid every 4 levels
        const digReduction = Math.floor((level - 1) * 0.3); // Slower dig reduction

        const baseConfig = {
            gridSize: opponent.gridSize + gridGrowth,
            digs: opponent.baseDigs - digReduction,
            treasures: opponent.treasures + (level >= 8 ? 1 : 0), // Extra treasure only at level 8+
            decoys: opponent.decoys + Math.floor((level - 1) / 5), // Slower decoy addition
            parDigs: 0, // Calculated below
            bonusObjective: null,
            scoreThreshold: 0 // For star bonus
        };

        // Ensure minimum digs for solvability
        const minDigs = baseConfig.treasures * 4 + 4;
        baseConfig.digs = Math.max(minDigs, baseConfig.digs);

        // Par is 60% of available digs (generous but challenging)
        baseConfig.parDigs = Math.floor(baseConfig.digs * 0.6);

        // Calculate score threshold for bonus star (varies by level)
        // Base threshold + level scaling, adjusted for opponent difficulty
        const baseDifficulty = opponent.id * 10; // Higher opponents = harder base
        baseConfig.scoreThreshold = 80 + (level * 15) + baseDifficulty;

        // Every level has a bonus objective for the second half-star
        // Alternating between different objective types for variety
        const objectiveTypes = [
            { type: 'score', desc: `Score ${baseConfig.scoreThreshold}+ points` },
            { type: 'efficiency', target: Math.ceil(baseConfig.digs * 0.3), desc: `Finish with ${Math.ceil(baseConfig.digs * 0.3)}+ digs remaining` },
            { type: 'noDecoy', desc: 'Complete without hitting any decoys' },
            { type: 'underPar', desc: `Finish under par (${baseConfig.parDigs}+ digs left)` },
            { type: 'combo', target: 2 + Math.floor(level / 3), desc: `Achieve ${2 + Math.floor(level / 3)}x combo` }
        ];

        // Assign objective based on level (cycles through types with some variation)
        const objIndex = (level + opponent.id) % objectiveTypes.length;
        baseConfig.bonusObjective = objectiveTypes[objIndex];

        // Override for specific milestone levels
        if (level === 5) {
            baseConfig.bonusObjective = { type: 'efficiency', target: Math.ceil(baseConfig.digs * 0.35),
                desc: `Master efficiency: ${Math.ceil(baseConfig.digs * 0.35)}+ digs remaining` };
        }
        if (level === 10) {
            baseConfig.bonusObjective = { type: 'perfect',
                desc: 'Perfect run: under par with no decoys' };
        }

        return baseConfig;
    };

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);

    // Grid state
    const [grid, setGrid] = useState([]);
    const [gridSize, setGridSize] = useState(6);
    const [treasurePositions, setTreasurePositions] = useState([]);
    const [decoyPositions, setDecoyPositions] = useState([]);
    const [gemPositions, setGemPositions] = useState([]);
    const [frozenTiles, setFrozenTiles] = useState([]);
    const [deepTiles, setDeepTiles] = useState([]);

    // Collectibles system - items scattered around to find
    const [collectiblePositions, setCollectiblePositions] = useState([]); // {x, y, type, collected}
    const [collectedItems, setCollectedItems] = useState([]); // Items found this level (treasure basket)
    const [friendsFound, setFriendsFound] = useState(0); // Little critter friends

    // Basket animation system
    const [fallingItems, setFallingItems] = useState([]); // Items currently falling into basket
    const [basketItems, setBasketItems] = useState([]); // Items that have landed in basket
    const [basketFull, setBasketFull] = useState(false); // Triggers lid animation
    const [truckDriving, setTruckDriving] = useState(false); // Truck animation state
    const [truckPosition, setTruckPosition] = useState(-200); // Truck X position
    const BASKET_CAPACITY = 8; // Items before basket is "full"

    // PHASE SYSTEM - The new gameplay loop!
    // Phases: 'prospect' -> 'dig' -> 'sort' -> 'reveal' -> 'score'
    const [gamePhase, setGamePhase] = useState('prospect');
    const [scansRemaining, setScansRemaining] = useState(0); // Scans for prospect phase
    const [markedTiles, setMarkedTiles] = useState([]); // Tiles marked during prospect
    const [excavatedItems, setExcavatedItems] = useState([]); // Items dug up (visible + dirt clumps)
    const [selectedForBasket, setSelectedForBasket] = useState([]); // Items chosen in sort phase
    const [revealedItems, setRevealedItems] = useState([]); // Items after dirt crumbles
    const [combinedItems, setCombinedItems] = useState([]); // Items after combinations
    const [phaseMessage, setPhaseMessage] = useState(''); // Current phase instruction
    const [signalStrengths, setSignalStrengths] = useState({}); // Tile scan results {x_y: strength}

    // What's hidden at each tile (treasure, junk, collectible, or nothing)
    const [hiddenContents, setHiddenContents] = useState({}); // {x_y: {type, itemKey, isDirt}}

    // World-themed special tiles
    const [specialTiles, setSpecialTiles] = useState([]); // {x, y, type, activated, direction?}
    const [illuminatedTiles, setIlluminatedTiles] = useState([]); // For spotlight reveals
    const [ambientParticles, setAmbientParticles] = useState([]); // Floating ambient effects
    const [currentTheme, setCurrentTheme] = useState(null); // Active world theme
    const [isLateLevel, setIsLateLevel] = useState(false); // Levels 6-10 = "late" variant

    // Player state
    const [dugTiles, setDugTiles] = useState([]);
    const [flaggedTiles, setFlaggedTiles] = useState([]);
    const [digsRemaining, setDigsRemaining] = useState(0);
    const [score, setScore] = useState(0);
    const [treasuresFound, setTreasuresFound] = useState(0);
    const [decoysHit, setDecoysHit] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [moveHistory, setMoveHistory] = useState([]);

    // Tools
    const [tools, setTools] = useState({});
    const [activeTool, setActiveTool] = useState(null);
    const [sonarTiles, setSonarTiles] = useState([]);
    const [sonarFading, setSonarFading] = useState(false); // For radar fade effect

    // Visual effects
    const [lastDigResult, setLastDigResult] = useState(null);
    const [hitEffects, setHitEffects] = useState([]);
    const [screenShake, setScreenShake] = useState(false);
    const [revealedTiles, setRevealedTiles] = useState([]);
    const [showHint, setShowHint] = useState(false);
    const [hintTile, setHintTile] = useState(null);

    // New JRPG UI state
    const [eventLog, setEventLog] = useState([]); // Recent game events for log panel
    const [legendExpanded, setLegendExpanded] = useState(false); // Legend collapse state
    const [mascotMood, setMascotMood] = useState('idle'); // Frog mascot mood
    const [activeMode, setActiveMode] = useState('scan'); // Current command mode
    const [scanRipples, setScanRipples] = useState([]); // Radial scan animations
    const [markStamps, setMarkStamps] = useState([]); // Stamp animations for marks
    const [digEffects, setDigEffects] = useState([]); // Dig/excavate effects
    const [revealCards, setRevealCards] = useState([]); // Item reveal popup cards

    // ============================================
    // WORLD MECHANIC STATE VARIABLES
    // ============================================
    // Funky Frog: Triangulation tracking
    const [triangulationScans, setTriangulationScans] = useState([]); // {x, y} positions of scans

    // Cheeky Chicken: Peck meter triggers decoy movement
    const [peckMeter, setPeckMeter] = useState(0);
    const [peckThreshold, setPeckThreshold] = useState(3);

    // Disco Dinosaur: Dual frequency scan modes
    const [scanMode, setScanMode] = useState('A'); // 'A' or 'B'
    const [roarCounter, setRoarCounter] = useState(0);

    // Radical Raccoon: Decoy AI behavior
    const [decoyHistory, setDecoyHistory] = useState([]); // Track where player scans
    const [gloveProtected, setGloveProtected] = useState(false);

    // Electric Eel: Charge management
    const [chargeLevel, setChargeLevel] = useState(5);
    const [maxCharge, setMaxCharge] = useState(5);
    const [stunned, setStunned] = useState(false);

    // Mysterious Moth: Fog of war
    const [fogTiles, setFogTiles] = useState([]); // Tiles currently fogged
    const [fogTimers, setFogTimers] = useState({}); // {key: turnsUntilRefog}
    const [lanternActive, setLanternActive] = useState(false);

    // Professor Penguin: Momentum/sliding + cold timer
    const [iceCracks, setIceCracks] = useState([]); // {x, y} cracked tiles
    const [coldTimer, setColdTimer] = useState(15);

    // Sly Snake: Shifting rooms
    const [shiftCounter, setShiftCounter] = useState(0);
    const [anchorTiles, setAnchorTiles] = useState([]); // Fixed hieroglyph tiles

    // Wolf Warrior: Deep dig + echo
    const [tileDepths, setTileDepths] = useState({}); // {key: depthRemaining}

    // Grand Master Grizzly: Combined mechanics tracker
    const [activeMechanicStates, setActiveMechanicStates] = useState({});

    // Universal mechanic display
    const [mechanicAlert, setMechanicAlert] = useState(null); // {message, type, duration}

    // Add event to log
    const addEventLog = useCallback((message) => {
        setEventLog(prev => [...prev.slice(-20), message]);
    }, []);

    // Set mascot mood with auto-reset
    const setMascotMoodTemp = useCallback((mood, duration = 2000) => {
        setMascotMood(mood);
        setTimeout(() => setMascotMood('idle'), duration);
    }, []);

    // Level config
    const [levelConfig, setLevelConfig] = useState(null);

    // Progression with enhanced tracking - v3 with fractional stars per level
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('treasuredig_progression_v3');
        if (saved) return JSON.parse(saved);
        // Initialize with per-level star tracking: each level can earn 0, 0.5, or 1 star
        // 0.5 for completing the level, +0.5 for achieving the bonus objective
        return {
            levelStars: Array(10).fill().map(() => Array(10).fill(0)), // 0, 0.5, or 1 per level
            levelsBeat: Array(10).fill().map(() => Array(10).fill(false)),
            bonusAchieved: Array(10).fill().map(() => Array(10).fill(false)), // Bonus objective per level
            bestScores: Array(10).fill().map(() => Array(10).fill(0)),
            achievements: [],
            totalTreasures: 0,
            totalGames: 0,
            hintsUsed: 0
        };
    });

    useEffect(() => {
        localStorage.setItem('treasuredig_progression_v3', JSON.stringify(progression));
    }, [progression]);

    // Clear mechanic alert after duration
    useEffect(() => {
        if (mechanicAlert) {
            const timer = setTimeout(() => {
                setMechanicAlert(null);
            }, mechanicAlert.duration || 1500);
            return () => clearTimeout(timer);
        }
    }, [mechanicAlert]);

    // Calculate total stars for an opponent (sum of all level stars, max 10)
    const getStars = (idx) => {
        const levelStars = progression.levelStars[idx] || Array(10).fill(0);
        return levelStars.reduce((sum, s) => sum + s, 0);
    };

    // Get star status for a specific level (0, 0.5, or 1)
    const getLevelStar = (oppIdx, level) => {
        return progression.levelStars[oppIdx]?.[level - 1] || 0;
    };

    // World unlocks when previous world has 10 stars (all levels completed with bonus)
    const isOpponentUnlocked = (idx) => idx === 0 || getStars(idx - 1) >= 10;
    const isOpponentMastered = (idx) => getStars(idx) >= 10;
    const isLevelUnlocked = (oppIdx, level) => {
        if (level === 1) return true;
        return progression.levelsBeat[oppIdx]?.[level - 2] || false;
    };

    // Calculate Euclidean distance
    const getDistance = (x1, y1, x2, y2) => {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    };

    // Get minimum distance to any unfound treasure
    const getMinTreasureDistance = useCallback((x, y, positions) => {
        if (!positions || positions.length === 0) return Infinity;
        return Math.min(...positions.map(t => getDistance(x, y, t.x, t.y)));
    }, []);

    // Get minimum distance to any decoy
    const getMinDecoyDistance = useCallback((x, y, positions) => {
        if (!positions || positions.length === 0) return Infinity;
        return Math.min(...positions.map(d => getDistance(x, y, d.x, d.y)));
    }, []);

    // Smart treasure placement - ensures solvability
    const placeItemsSmart = (size, count, excludePositions = [], minDistance = 2) => {
        const items = [];
        let attempts = 0;
        const maxAttempts = 1000;

        while (items.length < count && attempts < maxAttempts) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);

            // Check not on excluded positions
            const onExcluded = excludePositions.some(p => p.x === x && p.y === y);

            // Check minimum distance from other items
            const tooClose = items.some(p => getDistance(x, y, p.x, p.y) < minDistance);

            // Avoid edges for treasures (makes triangulation more interesting)
            const onEdge = x === 0 || y === 0 || x === size - 1 || y === size - 1;

            if (!onExcluded && !tooClose && !onEdge) {
                items.push({ x, y });
            }
            attempts++;
        }

        // Fallback if smart placement fails
        while (items.length < count) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            if (!excludePositions.some(p => p.x === x && p.y === y) &&
                !items.some(p => p.x === x && p.y === y)) {
                items.push({ x, y });
            }
        }

        return items;
    };

    // Initialize game grid with smart placement
    const initializeGrid = useCallback((opp, level) => {
        const config = getLevelConfig(opp, level);
        setLevelConfig(config);

        const size = Math.min(14, config.gridSize);
        setGridSize(size);

        // Place treasures with smart spacing
        const treasures = placeItemsSmart(size, config.treasures, [], 3);
        setTreasurePositions(treasures);

        // Place decoys away from treasures
        const decoys = opp.special.includes('decoys')
            ? placeItemsSmart(size, config.decoys, treasures, 2)
            : [];
        setDecoyPositions(decoys);

        // Place gems (old system - keeping for backwards compat but collectibles replace this)
        const gems = opp.special.includes('gems')
            ? placeItemsSmart(size, 2, [...treasures, ...decoys], 1)
                .map(g => ({ ...g, value: [15, 25, 50][Math.floor(Math.random() * 3)], type: Math.random() > 0.7 ? 'dig' : 'points' }))
            : [];
        setGemPositions(gems);

        // PLACE COLLECTIBLES - fun items to find!
        // More collectibles in early worlds to make them more fun
        // Scale: early worlds have more items, later worlds have fewer but more valuable
        const collectiblePool = worldCollectibles[opp.id] || worldCollectibles[0];
        const baseCollectibles = opp.id <= 2 ? 8 : opp.id <= 5 ? 6 : 4; // More in early worlds
        const numCollectibles = baseCollectibles + Math.floor(level / 3);
        const collectibleExclusions = [...treasures, ...decoys, ...gems];
        const collectibleSpots = placeItemsSmart(size, numCollectibles, collectibleExclusions, 1);

        const collectibles = collectibleSpots.map(pos => {
            // Pick a random collectible from the world's pool
            const typeKey = collectiblePool[Math.floor(Math.random() * collectiblePool.length)];
            return {
                ...pos,
                type: typeKey,
                collected: false
            };
        });
        setCollectiblePositions(collectibles);
        setCollectedItems([]); // Reset collected items list
        setFriendsFound(0);
        // Reset basket animation state
        setFallingItems([]);
        setBasketItems([]);
        setBasketFull(false);
        setTruckDriving(false);
        setTruckPosition(-200);

        // Place frozen tiles
        const frozen = opp.special.includes('frozen')
            ? placeItemsSmart(size, Math.floor(size * size * 0.12), [...treasures], 0)
            : [];
        setFrozenTiles(frozen);

        // Mark deep tiles
        const deep = opp.special.includes('deep')
            ? treasures.map(t => ({ ...t }))
            : [];
        setDeepTiles(deep);

        // Set world theme
        const worldTheme = worldThemes[opp.id] || worldThemes[0];
        setCurrentTheme(worldTheme);
        const lateLevel = level >= 6;
        setIsLateLevel(lateLevel);

        // Place world-themed special tiles (more in late levels)
        const specialCount = Math.floor(size * size * (lateLevel ? 0.08 : 0.05));
        const excludeFromSpecial = [...treasures, ...decoys, ...gems];
        const specialPositions = placeItemsSmart(size, specialCount, excludeFromSpecial, 1);

        // Add direction for current tiles, type info for all
        const specials = specialPositions.map((pos, idx) => ({
            ...pos,
            type: worldTheme.specialTile,
            activated: false,
            // Direction for current tiles (arrows)
            direction: worldTheme.specialTile === 'current'
                ? ['up', 'down', 'left', 'right'][idx % 4]
                : null
        }));
        setSpecialTiles(specials);
        setIlluminatedTiles([]);

        // Initialize ambient particles for visual flair
        const particles = [];
        for (let i = 0; i < 8; i++) {
            particles.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                emoji: worldTheme.ambientEmojis[i % worldTheme.ambientEmojis.length],
                speed: 0.5 + Math.random() * 1,
                drift: (Math.random() - 0.5) * 2
            });
        }
        setAmbientParticles(particles);

        // Initialize grid data
        const newGrid = [];
        for (let y = 0; y < size; y++) {
            const row = [];
            for (let x = 0; x < size; x++) {
                const isDeep = deep.some(d => d.x === x && d.y === y);
                const special = specials.find(s => s.x === x && s.y === y);
                row.push({
                    x, y,
                    dug: false,
                    dugDepth: 0,
                    requiredDepth: isDeep ? 2 : 1,
                    distance: null,
                    distanceInfo: null,
                    flagged: false,
                    revealed: false,
                    specialType: special?.type || null,
                    specialDirection: special?.direction || null
                });
            }
            newGrid.push(row);
        }
        setGrid(newGrid);

        // Set digs
        setDigsRemaining(config.digs);

        // Set tools
        const toolCounts = { ...opp.tools };
        // Add level bonuses
        if (level >= 5) toolCounts.radar = (toolCounts.radar || 0) + 1;
        if (level >= 8) toolCounts.xray = (toolCounts.xray || 0) + 1;
        setTools(toolCounts);
        setActiveTool(null);

        // Reset state
        setDugTiles([]);
        setFlaggedTiles([]);
        setScore(0);
        setTreasuresFound(0);
        setDecoysHit(0);
        setCombo(0);
        setMaxCombo(0);
        setMoveHistory([]);
        setLastDigResult(null);
        setHitEffects([]);
        setSonarTiles([]);
        setRevealedTiles(treasures.map(t => ({ ...t, time: Date.now() })));
        setShowHint(false);
        setHintTile(null);

        // === PHASE SYSTEM SETUP ===
        // Create hidden contents map for the entire grid
        const contents = {};
        const junkKeys = Object.keys(junkTypes);
        const specialItemKeys = Object.keys(specialItems);

        // Place treasures (dirt clumps)
        treasures.forEach(t => {
            contents[`${t.x}_${t.y}`] = { type: 'treasure', itemKey: 'treasure', isDirt: true, emoji: '💎', name: 'Treasure!', points: 100 };
        });

        // Place decoys/junk (dirt clumps that look like treasure signals)
        decoys.forEach(d => {
            const junkKey = junkKeys[Math.floor(Math.random() * junkKeys.length)];
            contents[`${d.x}_${d.y}`] = { type: 'junk', itemKey: junkKey, isDirt: true, ...junkTypes[junkKey] };
        });

        // Place collectibles (visible when dug)
        collectibles.forEach(c => {
            const collectible = collectibleTypes[c.type];
            contents[`${c.x}_${c.y}`] = { type: 'collectible', itemKey: c.type, isDirt: false, ...collectible };
        });

        // Add some special combinable items scattered around
        const specialItemCount = Math.floor(size * 0.8); // A few special items per level
        const emptyTiles = [];
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (!contents[`${x}_${y}`]) emptyTiles.push({ x, y });
            }
        }
        // Shuffle and place special items
        const shuffledEmpty = emptyTiles.sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(specialItemCount, shuffledEmpty.length); i++) {
            const pos = shuffledEmpty[i];
            const itemKey = specialItemKeys[Math.floor(Math.random() * specialItemKeys.length)];
            const item = specialItems[itemKey];
            contents[`${pos.x}_${pos.y}`] = { type: 'special', itemKey, isDirt: item.isDirtClump, ...item };
        }

        // Add extra junk to make decisions harder
        const extraJunkCount = Math.floor(size * 0.5);
        for (let i = specialItemCount; i < specialItemCount + extraJunkCount && i < shuffledEmpty.length; i++) {
            const pos = shuffledEmpty[i];
            const junkKey = junkKeys[Math.floor(Math.random() * junkKeys.length)];
            contents[`${pos.x}_${pos.y}`] = { type: 'junk', itemKey: junkKey, isDirt: true, ...junkTypes[junkKey] };
        }

        setHiddenContents(contents);

        // Set up phase state
        setGamePhase('prospect');
        setScansRemaining(2); // Only 2 radar scans - each scan affects adjacent tiles too!
        setMarkedTiles([]);
        setExcavatedItems([]);
        setSelectedForBasket([]);
        setRevealedItems([]);
        setCombinedItems([]);
        setSignalStrengths({});
        setPhaseMessage('🔍 PROSPECT PHASE - Scan tiles to detect signals!');

        // ============================================
        // INITIALIZE WORLD-SPECIFIC MECHANICS
        // ============================================
        const mechanic = worldMechanics[opp.id] || worldMechanics[0];

        // Reset all world mechanic states
        setTriangulationScans([]);
        setPeckMeter(0);
        setPeckThreshold(mechanic.mechanicRules?.peckThreshold || 3);
        setScanMode('A');
        setRoarCounter(0);
        setDecoyHistory([]);
        setGloveProtected(false);
        setChargeLevel(mechanic.mechanicRules?.maxCharge || 5);
        setMaxCharge(mechanic.mechanicRules?.maxCharge || 5);
        setStunned(false);
        setFogTiles([]);
        setFogTimers({});
        setLanternActive(false);
        setIceCracks([]);
        setColdTimer(mechanic.mechanicRules?.coldTimerTurns || 15);
        setShiftCounter(0);
        setAnchorTiles([]);
        setTileDepths({});
        setActiveMechanicStates({});
        setMechanicAlert(null);

        // World-specific initialization
        if (mechanic.primaryMechanic === 'fogOfWar') {
            // Start with all tiles fogged except center
            const foggedTiles = [];
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    // Leave center 2x2 area visible
                    const cx = Math.floor(size / 2);
                    const cy = Math.floor(size / 2);
                    if (Math.abs(x - cx) > 1 || Math.abs(y - cy) > 1) {
                        foggedTiles.push({ x, y });
                    }
                }
            }
            setFogTiles(foggedTiles);
        }

        if (mechanic.primaryMechanic === 'depthLayers') {
            // Set all tiles to require 2 digs
            const depths = {};
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    depths[`${x}_${y}`] = mechanic.mechanicRules?.layerCount || 2;
                }
            }
            setTileDepths(depths);
        }

        if (mechanic.primaryMechanic === 'shifting') {
            // Mark some tiles as anchors (can't be shifted)
            const anchors = [];
            const anchorCount = Math.floor(size * 0.3);
            for (let i = 0; i < anchorCount; i++) {
                anchors.push({
                    x: Math.floor(Math.random() * size),
                    y: Math.floor(Math.random() * size)
                });
            }
            setAnchorTiles(anchors);
        }

        return { size, treasures, config };
    }, []);

    // Start a match
    const startMatch = useCallback((opponent, level) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        const { size, treasures } = initializeGrid(opponent, level);
        setBonusAchieved(false); // Reset bonus tracking for new match

        // For early levels (1-3), give players a free starting hint
        // This makes early gameplay more strategic instead of random clicking
        if (level <= 3 && opponent.id <= 2) {
            setTimeout(() => {
                // Reveal a tile that's moderately close to treasure (gives direction)
                const hintTiles = [];
                for (let y = 0; y < size; y++) {
                    for (let x = 0; x < size; x++) {
                        const dist = Math.min(...treasures.map(t =>
                            Math.sqrt((t.x - x) ** 2 + (t.y - y) ** 2)
                        ));
                        // Pick tiles that are 2-4 distance away (not too close, not too far)
                        if (dist >= 2 && dist <= 4) {
                            hintTiles.push({ x, y, dist });
                        }
                    }
                }

                // Pick 1-2 good hint tiles and auto-reveal them
                const numHints = level === 1 ? 2 : 1;
                const sortedHints = hintTiles.sort((a, b) => a.dist - b.dist);
                const selectedHints = sortedHints.slice(0, numHints);

                selectedHints.forEach(hint => {
                    // Auto-dig this tile to give player a starting point
                    setGrid(g => {
                        if (!g[hint.y]) return g;
                        const newGrid = [...g];
                        newGrid[hint.y] = [...newGrid[hint.y]];
                        const dist = hint.dist;
                        const distInfo = getDistanceInfo(dist, size);
                        newGrid[hint.y][hint.x] = {
                            ...newGrid[hint.y][hint.x],
                            dug: true,
                            dugDepth: 1,
                            distance: Math.round(dist * 10) / 10,
                            distanceInfo: distInfo
                        };
                        return newGrid;
                    });
                    setDugTiles(d => [...d, { x: hint.x, y: hint.y }]);
                    addHitEffect(hint.x, hint.y, '🎁 Free hint!', 'info');
                });
            }, 500); // Slight delay for dramatic effect
        }

        // Show tutorial for first opponent, first level
        if (opponent.tutorial && level === 1 && !progression.levelsBeat[0][0]) {
            setShowTutorial(true);
            setTutorialStep(0);
        }

        setGameState('playing');
    }, [initializeGrid, progression.levelsBeat, getDistanceInfo, addHitEffect]);

    // Move treasure (for moving mechanic)
    const moveTreasure = useCallback(() => {
        if (!selectedOpponent?.special.includes('moving')) return;

        setTreasurePositions(current => {
            return current.map(t => {
                // Move in a semi-predictable pattern
                const directions = [
                    { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
                    { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
                    { dx: 1, dy: 1 }, { dx: -1, dy: -1 }
                ];

                // Prefer moving away from dug tiles
                const dugNearby = dugTiles.filter(d => getDistance(t.x, t.y, d.x, d.y) <= 2);
                let bestDir = directions[Math.floor(Math.random() * directions.length)];

                if (dugNearby.length > 0) {
                    // Move away from dug tiles
                    const avgX = dugNearby.reduce((sum, d) => sum + d.x, 0) / dugNearby.length;
                    const avgY = dugNearby.reduce((sum, d) => sum + d.y, 0) / dugNearby.length;
                    bestDir = {
                        dx: t.x > avgX ? 1 : -1,
                        dy: t.y > avgY ? 1 : -1
                    };
                }

                const newX = Math.max(1, Math.min(gridSize - 2, t.x + bestDir.dx));
                const newY = Math.max(1, Math.min(gridSize - 2, t.y + bestDir.dy));

                // Don't move to dug tile
                if (dugTiles.some(d => d.x === newX && d.y === newY)) {
                    return t;
                }

                return { x: newX, y: newY };
            });
        });

        // Visual feedback
        addHitEffect(gridSize / 2, 0, '🏃 Treasure moved!', 'info');
    }, [selectedOpponent, gridSize, dugTiles]);

    // Add visual effect
    const addHitEffect = useCallback((x, y, text, type) => {
        const id = Date.now() + Math.random();
        setHitEffects(e => [...e, { id, x, y, text, type }]);
        setTimeout(() => {
            setHitEffects(e => e.filter(ef => ef.id !== id));
        }, 1200);
    }, []);

    // Trigger screen shake
    const triggerShake = useCallback((intensity = 1) => {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 150 * intensity);
    }, []);

    // Add item to basket with falling physics animation
    const addToBasket = useCallback((emoji, name, points) => {
        const id = Date.now() + Math.random();

        // Create falling item - stays in fallingItems even after landing for visibility
        const newItem = {
            id,
            emoji,
            name,
            points,
            x: 20 + Math.random() * 60, // Random X within basket width
            y: -80, // Start above basket
            vy: 0,
            vx: (Math.random() - 0.5) * 3,
            rotation: Math.random() * 360,
            vr: (Math.random() - 0.5) * 12, // Rotation velocity
            landed: false,
            bounces: 0,
            groundY: 280 + Math.random() * 40 // Settle inside the basket area (basket starts at ~260)
        };

        setFallingItems(items => [...items, newItem]);
    }, []);

    // Physics update loop - runs continuously for all basket items
    useEffect(() => {
        if (fallingItems.length === 0 || basketFull) return;

        const gravity = 0.6;
        const bounce = 0.45;
        const friction = 0.97;

        const interval = setInterval(() => {
            setFallingItems(items => {
                const updated = items.map(item => {
                    if (item.landed) return item; // Don't update landed items

                    let { x, y, vx, vy, rotation, vr, groundY, bounces } = item;

                    // Apply gravity
                    vy += gravity;
                    y += vy;
                    x += vx;
                    rotation += vr;
                    vx *= friction;
                    vr *= friction;

                    // Bounce off sides of basket
                    if (x < 10) { x = 10; vx = Math.abs(vx) * bounce; }
                    if (x > 90) { x = 90; vx = -Math.abs(vx) * bounce; }

                    // Hit bottom
                    if (y >= groundY) {
                        y = groundY;
                        if (Math.abs(vy) > 2) {
                            vy = -vy * bounce;
                            vr = (Math.random() - 0.5) * 8;
                            bounces++;
                        } else {
                            // Settled - mark as landed
                            return { ...item, x, y: groundY, vx: 0, vy: 0, rotation, vr: 0, landed: true, bounces };
                        }
                    }

                    return { ...item, x, y, vx, vy, rotation, vr, bounces };
                });

                // Check if basket is full (all landed)
                const landedCount = updated.filter(i => i.landed).length;
                if (landedCount >= BASKET_CAPACITY) {
                    // Trigger basket full sequence
                    setTimeout(() => {
                        setBasketFull(true);
                        setTimeout(() => {
                            setTruckDriving(true);
                            let tx = -200;
                            const driveIn = setInterval(() => {
                                tx += 8;
                                setTruckPosition(tx);
                                if (tx >= 50) {
                                    clearInterval(driveIn);
                                    setTimeout(() => {
                                        const driveOut = setInterval(() => {
                                            tx += 12;
                                            setTruckPosition(tx);
                                            if (tx >= 400) {
                                                clearInterval(driveOut);
                                                setFallingItems([]);
                                                setBasketItems([]);
                                                setBasketFull(false);
                                                setTruckDriving(false);
                                                setTruckPosition(-200);
                                            }
                                        }, 25);
                                    }, 1000);
                                }
                            }, 25);
                        }, 600);
                    }, 200);
                }

                return updated;
            });
        }, 25);

        return () => clearInterval(interval);
    }, [fallingItems.length, basketFull, BASKET_CAPACITY]);

    // Use a tool
    const useTool = useCallback((toolName) => {
        if (tools[toolName] > 0) {
            if (activeTool === toolName) {
                setActiveTool(null);
            } else {
                setActiveTool(toolName);
            }
        }
    }, [tools, activeTool]);

    // Handle radar tool (row/column scan) - now with fade effect
    const handleRadar = useCallback((x, y) => {
        if (tools.radar <= 0) return;

        setTools(t => ({ ...t, radar: t.radar - 1 }));
        setActiveTool(null);
        setSonarFading(false);

        // Check row and column for treasures
        const inRow = treasurePositions.some(t => t.y === y);
        const inCol = treasurePositions.some(t => t.x === x);

        // Visual feedback - highlight tiles temporarily
        const rowTiles = [];
        const colTiles = [];
        for (let i = 0; i < gridSize; i++) {
            rowTiles.push({ x: i, y, highlight: inRow ? 'hot' : 'cold' });
            colTiles.push({ x, y: i, highlight: inCol ? 'hot' : 'cold' });
        }
        setSonarTiles([...rowTiles, ...colTiles]);

        const msg = inRow && inCol ? '📡 Treasure in BOTH row & column!' :
                    inRow ? '📡 Treasure in this ROW!' :
                    inCol ? '📡 Treasure in this COLUMN!' :
                    '📡 No treasure in row or column';
        addHitEffect(x, y, msg, inRow || inCol ? 'treasure' : 'info');

        // Start fading after 1.5s, then clear after fade completes
        setTimeout(() => setSonarFading(true), 1500);
        setTimeout(() => {
            setSonarTiles([]);
            setSonarFading(false);
        }, 3000);
    }, [tools, treasurePositions, gridSize, addHitEffect]);

    // Handle X-Ray tool (reveal without digging)
    const handleXRay = useCallback((x, y) => {
        if (tools.xray <= 0) return;
        if (dugTiles.some(d => d.x === x && d.y === y)) return;

        setTools(t => ({ ...t, xray: t.xray - 1 }));
        setActiveTool(null);

        // Check what's at this location
        const isTreasure = treasurePositions.some(t => t.x === x && t.y === y);
        const isDecoy = decoyPositions.some(d => d.x === x && d.y === y);
        const isGem = gemPositions.some(g => g.x === x && g.y === y);

        // Calculate distance
        const distance = getMinTreasureDistance(x, y, treasurePositions);
        const distanceInfo = getDistanceInfo(distance, gridSize);

        // Update grid with revealed info
        setGrid(g => {
            const newGrid = [...g];
            newGrid[y] = [...newGrid[y]];
            newGrid[y][x] = {
                ...newGrid[y][x],
                revealed: true,
                distance: Math.round(distance * 10) / 10,
                distanceInfo
            };
            return newGrid;
        });

        setRevealedTiles(r => [...r, { x, y, time: Date.now() }]);

        const msg = isTreasure ? '🔍 TREASURE HERE!' :
                    isDecoy ? '🔍 Decoy detected!' :
                    isGem ? '🔍 Gem here!' :
                    `🔍 Distance: ${distance.toFixed(1)}`;

        addHitEffect(x, y, msg, isTreasure ? 'treasure' : isDecoy ? 'decoy' : 'info');
        triggerShake(0.5);
    }, [tools, dugTiles, treasurePositions, decoyPositions, gemPositions, gridSize, getMinTreasureDistance, addHitEffect, triggerShake]);

    // Handle sonar tool (area reveal)
    const handleSonar = useCallback((x, y) => {
        if (tools.sonar <= 0) return;

        setTools(t => ({ ...t, sonar: t.sonar - 1 }));
        setActiveTool(null);

        const radius = 2;
        const tiles = [];

        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                    const dist = getMinTreasureDistance(nx, ny, treasurePositions);
                    const info = getDistanceInfo(dist, gridSize);
                    tiles.push({ x: nx, y: ny, distance: dist, info });
                }
            }
        }

        setSonarTiles(tiles);
        addHitEffect(x, y, '📡 Sonar pulse!', 'info');
        triggerShake(0.3);

        setTimeout(() => setSonarTiles([]), 3000);
    }, [tools, gridSize, treasurePositions, getMinTreasureDistance, addHitEffect, triggerShake]);

    // Handle special tile effects (world-themed mechanics)
    const handleSpecialTile = useCallback((x, y, tile) => {
        if (!tile.specialType || !currentTheme) return { canDig: true, extraEffect: null };

        const specialType = tile.specialType;

        switch (specialType) {
            case 'water': {
                // Water tiles need adjacent tiles dug first to "drain"
                const adjacentDug = [
                    { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
                    { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
                ].some(({ dx, dy }) => {
                    const nx = x + dx, ny = y + dy;
                    return nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && grid[ny]?.[nx]?.dug;
                });
                if (!adjacentDug) {
                    addHitEffect(x, y, '💧 Drain nearby first!', 'info');
                    return { canDig: false, extraEffect: null };
                }
                return { canDig: true, extraEffect: 'drained' };
            }

            case 'quicksand': {
                // Quicksand wastes the dig - no info revealed
                addHitEffect(x, y, '⏳ Quicksand! Dig wasted!', 'error');
                triggerShake(0.8);
                return { canDig: true, extraEffect: 'quicksand' }; // Dig consumed but no info
            }

            case 'nest': {
                // Nest gives bonus - points or extra dig
                const bonus = Math.random() > 0.5 ? 'dig' : 'points';
                if (bonus === 'dig') {
                    setDigsRemaining(d => d + 1);
                    addHitEffect(x, y, '🥚 +1 DIG!', 'gem');
                } else {
                    setScore(s => s + 25);
                    addHitEffect(x, y, '🥚 +25 points!', 'gem');
                }
                return { canDig: true, extraEffect: 'nest' };
            }

            case 'fossil': {
                // Fossil shows distance to ALL treasures
                const allDistances = treasurePositions.map(t =>
                    Math.round(getDistance(x, y, t.x, t.y) * 10) / 10
                );
                if (allDistances.length > 0) {
                    addHitEffect(x, y, `🦴 All: ${allDistances.join(', ')}`, 'info');
                }
                return { canDig: true, extraEffect: 'fossil' };
            }

            case 'spotlight': {
                // Spotlight illuminates 3x3 permanently
                const illuminated = [];
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nx = x + dx, ny = y + dy;
                        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                            illuminated.push({ x: nx, y: ny });
                        }
                    }
                }
                setIlluminatedTiles(prev => [...prev, ...illuminated]);
                addHitEffect(x, y, '💡 Area revealed!', 'info');
                return { canDig: true, extraEffect: 'spotlight' };
            }

            case 'firefly': {
                // Firefly briefly reveals random nearby tiles
                const nearbyTiles = [];
                for (let dy = -2; dy <= 2; dy++) {
                    for (let dx = -2; dx <= 2; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nx = x + dx, ny = y + dy;
                        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && !grid[ny]?.[nx]?.dug) {
                            nearbyTiles.push({ x: nx, y: ny });
                        }
                    }
                }
                // Reveal 3 random nearby tiles briefly via sonar display
                const shuffled = nearbyTiles.sort(() => Math.random() - 0.5).slice(0, 3);
                const reveals = shuffled.map(pos => {
                    const dist = getMinTreasureDistance(pos.x, pos.y, treasurePositions);
                    return { ...pos, distance: dist, info: getDistanceInfo(dist, gridSize) };
                });
                setSonarTiles(reveals);
                setTimeout(() => setSonarTiles([]), 2500);
                addHitEffect(x, y, '✨ Fireflies reveal!', 'info');
                return { canDig: true, extraEffect: 'firefly' };
            }

            case 'slide': {
                // Slide chains to next tile in a random direction
                const directions = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
                const dir = directions[Math.floor(Math.random() * 4)];
                const slideX = x + dir.dx, slideY = y + dir.dy;
                if (slideX >= 0 && slideX < gridSize && slideY >= 0 && slideY < gridSize && !grid[slideY]?.[slideX]?.dug) {
                    addHitEffect(x, y, '⛷️ Sliding!', 'info');
                    // Queue the slide dig (handled after this dig completes)
                    setTimeout(() => handleDig(slideX, slideY), 300);
                }
                return { canDig: true, extraEffect: 'slide' };
            }

            case 'echo': {
                // Echo reveals if treasure is in this row OR column
                const inRow = treasurePositions.some(t => t.y === y);
                const inCol = treasurePositions.some(t => t.x === x);
                const msg = inRow && inCol ? '🔊 Echo: ROW & COL!' :
                           inRow ? '🔊 Echo: in ROW!' :
                           inCol ? '🔊 Echo: in COLUMN!' :
                           '🔊 Echo: neither...';
                addHitEffect(x, y, msg, inRow || inCol ? 'treasure' : 'info');
                return { canDig: true, extraEffect: 'echo' };
            }

            case 'mirror': {
                // Mirror reflects dig to opposite side
                const mirrorX = gridSize - 1 - x;
                const mirrorY = gridSize - 1 - y;
                if (!grid[mirrorY]?.[mirrorX]?.dug) {
                    addHitEffect(x, y, '🪞 Mirrored!', 'info');
                    setTimeout(() => handleDig(mirrorX, mirrorY), 300);
                }
                return { canDig: true, extraEffect: 'mirror' };
            }

            case 'current': {
                // Current tiles are visual indicators - they shift items periodically
                // The shifting is handled elsewhere, this just marks the tile
                return { canDig: true, extraEffect: 'current' };
            }

            default:
                return { canDig: true, extraEffect: null };
        }
    }, [currentTheme, grid, gridSize, treasurePositions, getMinTreasureDistance, addHitEffect, triggerShake]);

    // Handle flag toggle
    const handleFlag = useCallback((x, y) => {
        const tile = grid[y]?.[x];
        if (!tile || tile.dug) return;

        const alreadyFlagged = flaggedTiles.some(f => f.x === x && f.y === y);

        if (alreadyFlagged) {
            setFlaggedTiles(f => f.filter(t => !(t.x === x && t.y === y)));
            setGrid(g => {
                const newGrid = [...g];
                newGrid[y] = [...newGrid[y]];
                newGrid[y][x] = { ...newGrid[y][x], flagged: false };
                return newGrid;
            });
        } else if (tools.flag > 0 || flaggedTiles.length < (tools.flag || 0)) {
            setFlaggedTiles(f => [...f, { x, y }]);
            setGrid(g => {
                const newGrid = [...g];
                newGrid[y] = [...newGrid[y]];
                newGrid[y][x] = { ...newGrid[y][x], flagged: true };
                return newGrid;
            });
        }

        setActiveTool(null);
    }, [grid, flaggedTiles, tools]);

    // === PHASE SYSTEM HANDLERS ===

    // Helper: Calculate signal strength for a tile
    const calculateSignalStrength = useCallback((tx, ty) => {
        const key = `${tx}_${ty}`;
        const content = hiddenContents[key];
        let strength = 0;
        let signalType = 'empty';

        if (content) {
            if (content.type === 'treasure') {
                strength = 3; // Strong signal
                signalType = 'strong';
            } else if (content.type === 'junk' && content.isDirt) {
                strength = 3; // Junk also gives strong signal (the trap!)
                signalType = 'strong';
            } else if (content.type === 'special' && content.isDirt) {
                strength = 2; // Medium signal for dirt-covered specials
                signalType = 'medium';
            } else if (content.type === 'collectible' || (content.type === 'special' && !content.isDirt)) {
                strength = 1; // Weak signal for visible items
                signalType = 'weak';
            }
        }
        return { strength, signalType };
    }, [hiddenContents]);

    // PROSPECT PHASE: Scan a tile - RADAR STYLE with WORLD MECHANICS
    const handleScan = useCallback((x, y) => {
        // Strict bounds checking
        if (gamePhase !== 'prospect') return;
        if (scansRemaining <= 0) {
            setPhaseMessage('❌ No scans left! Mark tiles and dig, or skip scanning.');
            return;
        }

        const worldId = selectedOpponent?.id || 0;
        const mechanic = worldMechanics[worldId] || worldMechanics[0];
        const scanTheme = worldScanThemes[worldId] || worldScanThemes[0];

        // ============================================
        // WORLD-SPECIFIC PRE-SCAN CHECKS
        // ============================================

        // Electric Eel: Check charge before scanning
        if (mechanic.primaryMechanic === 'chargeSystem') {
            if (chargeLevel <= 0) {
                setPhaseMessage('⚡ No charge! Find strong signals to recharge.');
                setMechanicAlert({ message: 'OUT OF CHARGE!', type: 'error', duration: 1500 });
                return;
            }
            setChargeLevel(prev => Math.max(0, prev - (mechanic.mechanicRules?.scanCost || 1)));
        }

        // Professor Penguin: Check cold timer and decrement
        if (mechanic.primaryMechanic === 'momentum') {
            setColdTimer(prev => {
                const newTime = prev - 1;
                if (newTime <= 3) {
                    setMechanicAlert({ message: `❄️ FREEZING! ${newTime} turns left!`, type: 'warning', duration: 1000 });
                }
                return newTime;
            });
        }

        const centerKey = `${x}_${y}`;

        // ============================================
        // CALCULATE BASE SIGNAL STRENGTH
        // ============================================
        const centerSignal = calculateSignalStrength(x, y);
        let centerVariance = Math.random() * 0.2 - 0.1;

        // Funky Frog: Add noise based on mechanic rules, reduced by triangulation
        if (mechanic.primaryMechanic === 'triangulation') {
            const noiseLevel = mechanic.mechanicRules?.signalNoise || 0.3;
            // Check if we have adjacent scans for triangulation bonus
            const nearbyScans = triangulationScans.filter(s =>
                Math.abs(s.x - x) <= 2 && Math.abs(s.y - y) <= 2
            );
            const triangulationReduction = nearbyScans.length * (mechanic.mechanicRules?.adjacentScanBoost || 0.5);
            centerVariance += (Math.random() * noiseLevel * 2 - noiseLevel) * Math.max(0.1, 1 - triangulationReduction);

            if (nearbyScans.length > 0) {
                setMechanicAlert({ message: `📐 Triangulation! +${Math.round(triangulationReduction * 100)}% accuracy`, type: 'info', duration: 1000 });
            }
            setTriangulationScans(prev => [...prev, { x, y }]);
        }

        // Disco Dinosaur: Dual frequency - only detect matching signal type
        if (mechanic.primaryMechanic === 'dualFrequency') {
            // Increment roar counter
            setRoarCounter(prev => {
                const newCount = prev + 1;
                if (newCount >= (mechanic.mechanicRules?.roarInterval || 4)) {
                    setMechanicAlert({ message: '🦖 ROAR! Weak signals reshuffled!', type: 'warning', duration: 1500 });
                    // Reshuffle logic could go here
                    return 0;
                }
                return newCount;
            });
        }

        // Mysterious Moth: Clear fog from scanned area
        if (mechanic.primaryMechanic === 'fogOfWar') {
            const clearedTiles = [{ x, y }];
            // Clear center and immediate adjacent tiles
            [{ dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 }].forEach(({ dx, dy }) => {
                clearedTiles.push({ x: x + dx, y: y + dy });
            });
            setFogTiles(prev => prev.filter(f =>
                !clearedTiles.some(c => c.x === f.x && c.y === f.y)
            ));
        }

        let centerStrength = Math.max(0, centerSignal.strength + centerVariance);

        // Build new signal strengths including center
        const newSignals = { [centerKey]: { strength: centerStrength, signalType: centerSignal.signalType, scanMode } };

        // Scan adjacent tiles at 50% strength (attenuated signal)
        const adjacent = [
            { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
            { dx: -1, dy: 0 },                      { dx: 1, dy: 0 },
            { dx: -1, dy: 1 },  { dx: 0, dy: 1 },  { dx: 1, dy: 1 }
        ];

        let strongAdjacentCount = 0;
        adjacent.forEach(({ dx, dy }) => {
            const ax = x + dx;
            const ay = y + dy;
            if (ax >= 0 && ax < gridSize && ay >= 0 && ay < gridSize) {
                const adjKey = `${ax}_${ay}`;
                if (signalStrengths[adjKey] === undefined) {
                    const adjSignal = calculateSignalStrength(ax, ay);
                    const adjVariance = Math.random() * 0.4 - 0.2;
                    const adjStrength = Math.max(0, (adjSignal.strength * 0.5) + adjVariance);
                    newSignals[adjKey] = { strength: adjStrength, signalType: adjSignal.signalType, isAdjacent: true };
                    if (adjSignal.strength >= 2.5) strongAdjacentCount++;
                }
            }
        });

        // Update all signals at once
        setSignalStrengths(prev => ({ ...prev, ...newSignals }));

        // Decrement scans (with safety check)
        setScansRemaining(prev => Math.max(0, prev - 1));

        // ============================================
        // WORLD-SPECIFIC POST-SCAN EFFECTS
        // ============================================

        // Cheeky Chicken: Increment peck meter, trigger decoy movement
        if (mechanic.primaryMechanic === 'peckMeter') {
            setPeckMeter(prev => {
                const newPeck = prev + 1;
                if (newPeck >= peckThreshold) {
                    setMechanicAlert({ message: '🐔 SQUAWK! Decoys scattered!', type: 'warning', duration: 1500 });
                    // Move some decoys randomly
                    setDecoyPositions(decoys => decoys.map(d => {
                        if (Math.random() < 0.5) {
                            const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
                            const dir = dirs[Math.floor(Math.random() * dirs.length)];
                            const nx = Math.max(0, Math.min(gridSize - 1, d.x + dir.dx));
                            const ny = Math.max(0, Math.min(gridSize - 1, d.y + dir.dy));
                            return { x: nx, y: ny };
                        }
                        return d;
                    }));
                    return 0; // Reset peck meter
                }
                return newPeck;
            });
        }

        // Radical Raccoon: Track scan history, decoys move toward scanned areas
        if (mechanic.primaryMechanic === 'decoyAI') {
            setDecoyHistory(prev => [...prev, { x, y }]);
            if (Math.random() < (mechanic.mechanicRules?.decoyAttraction || 0.7)) {
                setDecoyPositions(decoys => decoys.map(d => {
                    // Move decoy toward most scanned area
                    const dx = x > d.x ? 1 : x < d.x ? -1 : 0;
                    const dy = y > d.y ? 1 : y < d.y ? -1 : 0;
                    const nx = Math.max(0, Math.min(gridSize - 1, d.x + dx));
                    const ny = Math.max(0, Math.min(gridSize - 1, d.y + dy));
                    return { x: nx, y: ny };
                }));
            }
        }

        // Professor Penguin: Check for ice cracking (adjacent scans)
        if (mechanic.primaryMechanic === 'momentum') {
            const adjacentScansCount = adjacent.filter(({ dx, dy }) => {
                const adjKey = `${x + dx}_${y + dy}`;
                return signalStrengths[adjKey] !== undefined;
            }).length;

            if (adjacentScansCount >= (mechanic.mechanicRules?.crackThreshold || 2)) {
                setIceCracks(prev => [...prev, { x, y }]);
                setMechanicAlert({ message: '🧊 CRACK! Ice line revealed!', type: 'info', duration: 1200 });
            }
        }

        // Sly Snake: Increment shift counter, trigger room shift
        if (mechanic.primaryMechanic === 'shifting') {
            setShiftCounter(prev => {
                const newCount = prev + 1;
                if (newCount >= (mechanic.mechanicRules?.shiftInterval || 3)) {
                    setMechanicAlert({ message: '🐍 The temple shifts!', type: 'warning', duration: 1500 });
                    // Shift logic would go here (rotate a row/column)
                    return 0;
                }
                return newCount;
            });
        }

        // Get feedback for center tile
        const feedback = centerStrength >= 2.5 ? scanTheme.strong
            : centerStrength >= 1.5 ? scanTheme.medium
            : centerStrength >= 0.5 ? scanTheme.weak
            : scanTheme.none;

        // Visual feedback with mechanic-specific label additions
        let extraLabel = '';
        if (strongAdjacentCount > 0) extraLabel += ` (+${strongAdjacentCount} nearby!)`;
        if (mechanic.primaryMechanic === 'dualFrequency') extraLabel += ` [Mode ${scanMode}]`;
        if (mechanic.primaryMechanic === 'chargeSystem') extraLabel += ` [⚡${chargeLevel}]`;

        setLastDigResult({
            x, y,
            emoji: feedback.emoji,
            label: feedback.label + extraLabel,
            color: feedback.color,
            tier: centerStrength >= 2.5 ? 1 : centerStrength >= 1.5 ? 3 : centerStrength >= 0.5 ? 5 : 7
        });

        addEventLog(`Scanned (${x},${y}): ${feedback.label}`);

        if (scansRemaining <= 1) {
            setTimeout(() => {
                setPhaseMessage('📍 Right-click tiles to MARK them, then click READY TO DIG!');
            }, 500);
        }
    }, [gamePhase, scansRemaining, signalStrengths, calculateSignalStrength, gridSize, selectedOpponent, addEventLog,
        chargeLevel, scanMode, triangulationScans, peckThreshold, setMascotMoodTemp]);

    // PROSPECT PHASE: Mark/unmark a tile for digging
    const handleMark = useCallback((x, y) => {
        if (gamePhase !== 'prospect') return;

        setMarkedTiles(prev => {
            const isAlreadyMarked = prev.some(t => t.x === x && t.y === y);
            if (isAlreadyMarked) {
                addEventLog(`Unmarked tile (${x},${y})`);
                return prev.filter(t => !(t.x === x && t.y === y));
            } else {
                addEventLog(`Marked tile (${x},${y}) for digging`);
                setMascotMoodTemp('happy', 500);
                return [...prev, { x, y }];
            }
        });
    }, [gamePhase, addEventLog, setMascotMoodTemp]);

    // Transition to DIG phase
    const startDigPhase = useCallback(() => {
        if (markedTiles.length === 0) {
            setPhaseMessage('⚠️ Mark at least one tile to dig!');
            return;
        }
        setGamePhase('dig');
        setDigsRemaining(Math.min(markedTiles.length + 2, Math.floor(gridSize * 0.8))); // Limited digs!
        setPhaseMessage('⛏️ DIG PHASE - Excavate your marked tiles!');
    }, [markedTiles, gridSize]);

    // DIG PHASE: Excavate a tile with WORLD MECHANICS
    const handleExcavate = useCallback((x, y) => {
        if (gamePhase !== 'dig' || digsRemaining <= 0) return;

        const worldId = selectedOpponent?.id || 0;
        const mechanic = worldMechanics[worldId] || worldMechanics[0];
        const key = `${x}_${y}`;
        const tile = grid[y]?.[x];
        if (!tile || tile.dug) return;

        // ============================================
        // WORLD-SPECIFIC PRE-DIG CHECKS
        // ============================================

        // Wolf Warrior: Deep dig - check if tile needs multiple digs
        if (mechanic.primaryMechanic === 'depthLayers') {
            const currentDepth = tileDepths[key] || 1;
            if (currentDepth > 1) {
                // First dig only clears rubble
                setTileDepths(prev => ({ ...prev, [key]: currentDepth - 1 }));
                setDigsRemaining(prev => Math.max(0, prev - 1));
                setMechanicAlert({ message: '⛏️ Rubble cleared! Dig again to extract.', type: 'info', duration: 1200 });
                addEventLog(`Cleared rubble at (${x},${y}) - ${currentDepth - 1} layers left`);

                // Mark as partially dug but not fully excavated
                setGrid(g => {
                    const newGrid = [...g];
                    newGrid[y] = [...newGrid[y]];
                    newGrid[y][x] = { ...newGrid[y][x], dugDepth: (tile.dugDepth || 0) + 1, partiallyDug: true };
                    return newGrid;
                });

                if (digsRemaining <= 1) {
                    setTimeout(() => {
                        setGamePhase('sort');
                        setPhaseMessage('🧺 SORT PHASE - Choose what to keep! (Basket holds ' + BASKET_CAPACITY + ' items)');
                    }, 500);
                }
                return; // Don't fully excavate yet
            }
        }

        // Sly Snake: Check for trap door
        if (mechanic.primaryMechanic === 'shifting' && mechanic.mechanicRules?.trapDoorChance) {
            if (Math.random() < mechanic.mechanicRules.trapDoorChance) {
                setMechanicAlert({ message: '🕳️ TRAP DOOR! Dig wasted!', type: 'error', duration: 1500 });
                setDigsRemaining(prev => Math.max(0, prev - 1));
                addEventLog(`Trap door sprung at (${x},${y})!`);

                if (digsRemaining <= 1) {
                    setTimeout(() => {
                        setGamePhase('sort');
                        setPhaseMessage('🧺 SORT PHASE - Choose what to keep!');
                    }, 500);
                }
                return; // Dig consumed but nothing revealed
            }
        }

        // Mark tile as dug
        setGrid(g => {
            const newGrid = [...g];
            newGrid[y] = [...newGrid[y]];
            newGrid[y][x] = { ...newGrid[y][x], dug: true, dugDepth: mechanic.mechanicRules?.layerCount || 1 };
            return newGrid;
        });
        setDugTiles(prev => [...prev, { x, y }]);
        setDigsRemaining(prev => Math.max(0, prev - 1));

        // Get what was at this tile
        const content = hiddenContents[key];

        // ============================================
        // WORLD-SPECIFIC POST-DIG EFFECTS
        // ============================================

        // Electric Eel: Recharge on strong signal dig
        if (mechanic.primaryMechanic === 'chargeSystem') {
            const signalInfo = signalStrengths[key];
            if (signalInfo && signalInfo.strength >= 2.5) {
                const rechargeAmount = mechanic.mechanicRules?.rechargeOnStrongDig || 2;
                setChargeLevel(prev => Math.min(maxCharge, prev + rechargeAmount));
                setMechanicAlert({ message: `⚡ +${rechargeAmount} CHARGE!`, type: 'info', duration: 1000 });
            }
            // Check for shock risk on empty tiles
            if (!content && Math.random() < 0.2) {
                setStunned(true);
                setMechanicAlert({ message: '⚡ SHOCKED! Skip next action.', type: 'error', duration: 1500 });
                setTimeout(() => setStunned(false), 2000);
            }
        }

        // Professor Penguin: Sliding dig - dig continues in a direction
        if (mechanic.primaryMechanic === 'momentum' && mechanic.mechanicRules?.slideDistance) {
            const slideDir = { dx: Math.random() > 0.5 ? 1 : -1, dy: Math.random() > 0.5 ? 1 : -1 };
            const slideX = x + slideDir.dx;
            const slideY = y + slideDir.dy;

            if (slideX >= 0 && slideX < gridSize && slideY >= 0 && slideY < gridSize) {
                const slideTile = grid[slideY]?.[slideX];
                if (slideTile && !slideTile.dug && digsRemaining > 1) {
                    setMechanicAlert({ message: '⛷️ SLIDE! Bonus dig!', type: 'info', duration: 1000 });
                    // Queue the slide dig
                    setTimeout(() => handleExcavate(slideX, slideY), 400);
                }
            }
        }

        // Radical Raccoon: Pickpocket penalty on decoy
        if (mechanic.primaryMechanic === 'decoyAI' && content?.type === 'junk') {
            if (!gloveProtected) {
                const penalty = mechanic.mechanicRules?.pickpocketPenalty || 10;
                setScore(prev => Math.max(0, prev - penalty));
                setMechanicAlert({ message: `🦝 PICKPOCKET! -${penalty} coins!`, type: 'error', duration: 1500 });
            } else {
                setMechanicAlert({ message: '🧤 Glove protected you!', type: 'info', duration: 1000 });
            }
        }

        // Cheeky Chicken: Shiny bonus (gems worth double)
        let bonusMultiplier = 1;
        if (mechanic.primaryMechanic === 'peckMeter' && mechanic.mechanicRules?.shinyDoubleValue) {
            if (content?.type === 'collectible' && content?.itemKey?.includes('gem')) {
                bonusMultiplier = 2;
                setMechanicAlert({ message: '✨ SHINY! Double value!', type: 'info', duration: 1000 });
            }
        }

        if (content) {
            const excavatedItem = {
                id: `${key}_${Date.now()}`,
                ...content,
                x, y,
                points: (content.points || 0) * bonusMultiplier,
                displayEmoji: content.isDirt ? '🟤' : content.emoji,
                displayName: content.isDirt ? 'Dirt Clump' : content.name,
            };
            setExcavatedItems(prev => [...prev, excavatedItem]);
        }

        // Check if we should transition to SORT
        if (digsRemaining <= 1) {
            setTimeout(() => {
                setGamePhase('sort');
                setPhaseMessage('🧺 SORT PHASE - Choose what to keep! (Basket holds ' + BASKET_CAPACITY + ' items)');
            }, 500);
        }
    }, [gamePhase, digsRemaining, grid, hiddenContents, BASKET_CAPACITY, selectedOpponent, tileDepths,
        signalStrengths, maxCharge, gloveProtected, gridSize, addEventLog]);

    // SORT PHASE: Toggle item selection
    const toggleItemSelection = useCallback((itemId) => {
        if (gamePhase !== 'sort') return;

        setSelectedForBasket(prev => {
            if (prev.includes(itemId)) {
                return prev.filter(id => id !== itemId);
            }
            if (prev.length >= BASKET_CAPACITY) {
                setPhaseMessage('🧺 Basket is full! Remove something first.');
                return prev;
            }
            return [...prev, itemId];
        });
    }, [gamePhase, BASKET_CAPACITY]);

    // Transition to REVEAL phase
    const startRevealPhase = useCallback(() => {
        if (selectedForBasket.length === 0) {
            setPhaseMessage('⚠️ Select at least one item to keep!');
            return;
        }

        // Get the selected items
        const keptItems = excavatedItems.filter(item => selectedForBasket.includes(item.id));
        setGamePhase('reveal');
        setPhaseMessage('✨ REVEAL PHASE - See what you found!');

        // Animate reveal - dirt clumps break apart
        let revealIndex = 0;
        const revealNext = () => {
            if (revealIndex >= keptItems.length) {
                // All revealed, do combinations!
                setTimeout(() => processCombinations(keptItems), 500);
                return;
            }

            const item = keptItems[revealIndex];
            setRevealedItems(prev => [...prev, {
                ...item,
                displayEmoji: item.emoji, // Now show actual emoji
                displayName: item.name,
                justRevealed: true
            }]);

            revealIndex++;
            setTimeout(revealNext, 600); // Stagger reveals
        };

        setTimeout(revealNext, 300);
    }, [selectedForBasket, excavatedItems]);

    // Process item combinations
    const processCombinations = useCallback((items) => {
        const usedIndices = new Set();
        const results = [];
        const combos = [];

        // Check for all possible combinations
        for (let i = 0; i < items.length; i++) {
            if (usedIndices.has(i)) continue;

            for (let j = i + 1; j < items.length; j++) {
                if (usedIndices.has(j)) continue;

                const item1 = items[i];
                const item2 = items[j];

                // Try both orders
                const key1 = `${item1.itemKey}+${item2.itemKey}`;
                const key2 = `${item2.itemKey}+${item1.itemKey}`;

                const combo = combinations[key1] || combinations[key2];
                if (combo) {
                    // Check if it needs two of same
                    if (combo.needsTwo && item1.itemKey !== item2.itemKey) continue;

                    usedIndices.add(i);
                    usedIndices.add(j);
                    combos.push({
                        item1, item2, result: combo,
                        id: `combo_${Date.now()}_${i}_${j}`
                    });
                }
            }
        }

        // Add uncombined items
        items.forEach((item, i) => {
            if (!usedIndices.has(i)) {
                results.push(item);
            }
        });

        // Add combo results
        combos.forEach(c => {
            results.push({
                id: c.id,
                emoji: c.result.emoji,
                name: c.result.name,
                points: c.result.points,
                isCombo: true,
                from: [c.item1, c.item2]
            });
        });

        setCombinedItems(results);
        setPhaseMessage(combos.length > 0 ? '🎉 COMBINATIONS FOUND!' : '📦 Here\'s your haul!');

        // Calculate score and transition to result screen
        setTimeout(() => {
            const totalPoints = results.reduce((sum, item) => sum + (item.points || 0), 0);
            const foundTreasure = results.some(item => item.type === 'treasure');
            setScore(totalPoints);
            setTreasuresFound(foundTreasure ? 1 : 0);

            // Clear treasure positions if found (for win condition)
            if (foundTreasure) {
                setTreasurePositions([]);
            }

            // Short delay to admire the haul, then show result screen
            setTimeout(() => {
                setGameState('result');
            }, 1500);
        }, combos.length > 0 ? 2000 : 1000);
    }, [combinations]);

    // Skip to dig phase (use remaining scans on random tiles)
    const skipToDigPhase = useCallback(() => {
        setGamePhase('dig');
        setDigsRemaining(Math.max(5, Math.floor(gridSize * 0.7)));
        setPhaseMessage('⛏️ DIG PHASE - Excavate tiles to find items!');
    }, [gridSize]);

    // Main tile click handler - routes to appropriate phase handler
    const handleTileClick = useCallback((x, y, isRightClick = false) => {
        if (gameState !== 'playing') return;

        // Handle based on current phase
        if (gamePhase === 'prospect') {
            if (isRightClick) {
                handleMark(x, y); // Right-click to mark
            } else {
                handleScan(x, y); // Left-click to scan
            }
            return;
        }

        if (gamePhase === 'dig') {
            handleExcavate(x, y);
            return;
        }

        // Other phases don't use tile clicks
        return;
    }, [gameState, gamePhase, handleScan, handleMark, handleExcavate]);

    // Legacy dig handler (for backwards compatibility)
    const handleDig = useCallback((x, y) => {
        // Route to new phase system - ALL phase states go through new system
        if (['prospect', 'dig', 'sort', 'reveal', 'score'].includes(gamePhase)) {
            if (gamePhase === 'prospect' || gamePhase === 'dig') {
                handleTileClick(x, y);
            }
            // Other phases ignore tile clicks
            return;
        }

        // Legacy code below - should NOT run during normal gameplay now
        if (gameState !== 'playing' || digsRemaining <= 0) return;

        const tile = grid[y]?.[x];
        if (!tile) return;

        // Handle tool usage
        if (activeTool === 'radar') {
            handleRadar(x, y);
            return;
        }
        if (activeTool === 'xray') {
            handleXRay(x, y);
            return;
        }
        if (activeTool === 'sonar') {
            handleSonar(x, y);
            return;
        }
        if (activeTool === 'flag') {
            handleFlag(x, y);
            return;
        }

        // Check if already fully dug
        if (tile.dug && tile.dugDepth >= tile.requiredDepth) return;

        // Handle special tile pre-check (water blocking, etc.)
        const specialResult = handleSpecialTile(x, y, tile);
        if (!specialResult.canDig) {
            return; // Special tile blocked the dig (e.g., water not drained)
        }

        // Check frozen tile cost
        const isFrozen = frozenTiles.some(f => f.x === x && f.y === y) && !tile.dug;
        const digCost = isFrozen ? 2 : 1;

        if (digsRemaining < digCost) {
            addHitEffect(x, y, 'Not enough digs!', 'error');
            return;
        }

        // Deduct digs
        setDigsRemaining(d => d - digCost);

        // Handle quicksand - dig is consumed but no info revealed
        if (specialResult.extraEffect === 'quicksand') {
            setDugTiles(d => [...d, { x, y }]);
            setGrid(g => {
                const newGrid = [...g];
                newGrid[y] = [...newGrid[y]];
                newGrid[y][x] = { ...tile, dug: true, dugDepth: 1, distance: '?', distanceInfo: { color: '#888', label: 'Lost!', emoji: '⏳', tier: 9 } };
                return newGrid;
            });
            setMoveHistory(h => [...h, { x, y, time: Date.now() }]);
            return; // No further processing
        }

        // Track move
        setMoveHistory(h => [...h, { x, y, time: Date.now() }]);

        // Handle deep digging
        const newDepth = (tile.dugDepth || 0) + 1;
        if (newDepth < tile.requiredDepth) {
            setGrid(g => {
                const newGrid = [...g];
                newGrid[y] = [...newGrid[y]];
                newGrid[y][x] = { ...tile, dugDepth: newDepth };
                return newGrid;
            });
            addHitEffect(x, y, '⛏️ Dig deeper!', 'info');
            triggerShake(0.5);
            return;
        }

        // Calculate distance to nearest treasure
        const treasureDistance = getMinTreasureDistance(x, y, treasurePositions);
        const decoyDistance = getMinDecoyDistance(x, y, decoyPositions);

        // Show distance to closest (treasure or decoy)
        const showDistance = Math.min(treasureDistance, decoyDistance);
        const distanceInfo = getDistanceInfo(showDistance, gridSize);

        // Update grid
        setGrid(g => {
            const newGrid = [...g];
            newGrid[y] = [...newGrid[y]];
            newGrid[y][x] = {
                ...tile,
                dug: true,
                dugDepth: newDepth,
                distance: Math.round(showDistance * 10) / 10,
                distanceInfo,
                flagged: false
            };
            return newGrid;
        });

        setDugTiles(d => [...d, { x, y }]);
        setRevealedTiles(r => [...r, { x, y, time: Date.now() }]);
        setFlaggedTiles(f => f.filter(t => !(t.x === x && t.y === y)));

        // Update combo based on distance
        if (distanceInfo.tier <= 3) {
            setCombo(c => {
                const newCombo = c + 1;
                if (newCombo > maxCombo) setMaxCombo(newCombo);
                if (newCombo >= 3) {
                    addHitEffect(x, y, `🔥 ${newCombo}x COMBO!`, 'combo');
                    setScore(s => s + newCombo * 5);
                }
                return newCombo;
            });
        } else {
            setCombo(0);
        }

        setLastDigResult({ x, y, distance: showDistance, ...distanceInfo });

        // Check for treasure
        const foundTreasure = treasurePositions.find(t => t.x === x && t.y === y);
        if (foundTreasure) {
            setTreasuresFound(f => f + 1);
            const treasureScore = 100 + combo * 20;
            setScore(s => s + treasureScore);
            addHitEffect(x, y, `💎 +${treasureScore} TREASURE!`, 'treasure');
            triggerShake(1.5);

            setTreasurePositions(t => t.filter(pos => !(pos.x === x && pos.y === y)));

            // Check win condition
            if (treasurePositions.length <= 1) {
                setTimeout(() => setGameState('result'), 800);
            }
            return;
        }

        // Check for decoy
        const foundDecoy = decoyPositions.find(d => d.x === x && d.y === y);
        if (foundDecoy) {
            setDecoysHit(d => d + 1);
            setScore(s => Math.max(0, s - 30));
            addHitEffect(x, y, '💀 -30 DECOY!', 'decoy');
            setDecoyPositions(d => d.filter(pos => !(pos.x === x && pos.y === y)));
            triggerShake(1);
            setCombo(0);
            return;
        }

        // Check for gem (legacy system)
        const foundGem = gemPositions.find(g => g.x === x && g.y === y);
        if (foundGem) {
            if (foundGem.type === 'dig') {
                setDigsRemaining(d => d + 1);
                addHitEffect(x, y, '💚 +1 DIG!', 'gem');
            } else {
                setScore(s => s + foundGem.value);
                addHitEffect(x, y, `💎 +${foundGem.value}`, 'gem');
            }
            setGemPositions(g => g.filter(pos => !(pos.x === x && pos.y === y)));
        }

        // CHECK FOR COLLECTIBLES - fun items!
        const foundCollectible = collectiblePositions.find(c => c.x === x && c.y === y && !c.collected);
        if (foundCollectible) {
            const itemInfo = collectibleTypes[foundCollectible.type];
            if (itemInfo) {
                // Add points
                setScore(s => s + itemInfo.points);

                // Add to collected items list (for stats)
                setCollectedItems(items => [...items, {
                    type: foundCollectible.type,
                    emoji: itemInfo.emoji,
                    name: itemInfo.name,
                    points: itemInfo.points,
                    time: Date.now()
                }]);

                // Trigger falling animation into basket!
                addToBasket(itemInfo.emoji, itemInfo.name, itemInfo.points);

                // Mark as collected
                setCollectiblePositions(c => c.map(col =>
                    col.x === x && col.y === y ? { ...col, collected: true } : col
                ));

                // Special effect for critter friends
                if (itemInfo.effect === 'friend') {
                    setFriendsFound(f => f + 1);
                    addHitEffect(x, y, `${itemInfo.emoji} New friend!`, 'friend');
                } else {
                    addHitEffect(x, y, `${itemInfo.emoji}`, 'collectible');
                }

                triggerShake(0.4);
            }
        }

        // Regular dig feedback
        addHitEffect(x, y, distanceInfo.emoji, 'dig');
        triggerShake(0.3);

        // Move treasure periodically
        if (selectedOpponent?.special.includes('moving') && moveHistory.length > 0 && (moveHistory.length + 1) % 4 === 0) {
            setTimeout(moveTreasure, 500);
        }

        // Check lose condition
        if (digsRemaining - digCost <= 0 && treasurePositions.length > 0) {
            setTimeout(() => setGameState('result'), 800);
        }
    }, [gameState, digsRemaining, grid, activeTool, frozenTiles, treasurePositions,
        decoyPositions, gemPositions, collectiblePositions, gridSize, combo, maxCombo, moveHistory,
        selectedOpponent, getMinTreasureDistance, getMinDecoyDistance,
        handleRadar, handleXRay, handleSonar, handleFlag, handleSpecialTile, moveTreasure,
        addHitEffect, triggerShake, addToBasket]);

    // Hint system
    const getHint = useCallback(() => {
        if (treasurePositions.length === 0) return;

        // Find the best undug tile to suggest
        const undugTiles = [];
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (!grid[y][x].dug) {
                    const dist = getMinTreasureDistance(x, y, treasurePositions);
                    undugTiles.push({ x, y, dist });
                }
            }
        }

        // Sort by distance and suggest a good one (not the best, to keep challenge)
        undugTiles.sort((a, b) => a.dist - b.dist);
        const hintIndex = Math.min(2, Math.floor(undugTiles.length * 0.1));
        const hint = undugTiles[hintIndex];

        if (hint) {
            setHintTile(hint);
            setShowHint(true);
            setProgression(p => ({ ...p, hintsUsed: p.hintsUsed + 1 }));
            setTimeout(() => setShowHint(false), 3000);
        }
    }, [treasurePositions, gridSize, grid, getMinTreasureDistance]);

    // Fog of war effect
    useEffect(() => {
        if (!selectedOpponent?.special.includes('fog')) return;

        const interval = setInterval(() => {
            const now = Date.now();
            setRevealedTiles(tiles => tiles.filter(t => now - t.time < 8000));
        }, 1000);

        return () => clearInterval(interval);
    }, [selectedOpponent]);

    // Track bonus objective achievement for result screen
    const [bonusAchieved, setBonusAchieved] = useState(false);

    // Check if bonus objective was achieved
    const checkBonusObjective = useCallback((config, finalScore) => {
        if (!config?.bonusObjective) return false;

        const obj = config.bonusObjective;
        switch (obj.type) {
            case 'score':
                return finalScore >= config.scoreThreshold;
            case 'efficiency':
                return digsRemaining >= obj.target;
            case 'noDecoy':
                return decoysHit === 0;
            case 'underPar':
                return digsRemaining >= config.parDigs;
            case 'combo':
                return maxCombo >= obj.target;
            case 'perfect':
                return digsRemaining >= config.parDigs && decoysHit === 0;
            default:
                return false;
        }
    }, [digsRemaining, decoysHit, maxCombo]);

    // Handle result
    useEffect(() => {
        if (gameState !== 'result') return;

        const won = treasurePositions.length === 0;
        const config = levelConfig;

        if (won && config) {
            // Calculate bonuses
            const digBonus = digsRemaining * 10;
            const comboBonus = maxCombo * 15;
            const noDecoyBonus = decoysHit === 0 ? 50 : 0;
            const underParBonus = digsRemaining >= config.parDigs ? 75 : 0;

            const totalBonus = digBonus + comboBonus + noDecoyBonus + underParBonus;
            setScore(s => s + totalBonus);

            const finalScore = score + totalBonus;

            // Check if bonus objective achieved
            const bonusCompleted = checkBonusObjective(config, finalScore);
            setBonusAchieved(bonusCompleted);

            // Calculate stars: 0.5 for completion, +0.5 for bonus objective
            const completionStar = 0.5;
            const bonusStar = bonusCompleted ? 0.5 : 0;
            const totalStarEarned = completionStar + bonusStar;

            setProgression(prev => {
                const newLevelStars = prev.levelStars.map(arr => [...arr]);
                // Only update if we earned more stars than before
                const currentStar = newLevelStars[selectedOpponent.id][currentLevel - 1] || 0;
                newLevelStars[selectedOpponent.id][currentLevel - 1] = Math.max(currentStar, totalStarEarned);

                const newLevelsBeat = prev.levelsBeat.map(arr => [...arr]);
                newLevelsBeat[selectedOpponent.id][currentLevel - 1] = true;

                const newBonusAchieved = prev.bonusAchieved.map(arr => [...arr]);
                if (bonusCompleted) {
                    newBonusAchieved[selectedOpponent.id][currentLevel - 1] = true;
                }

                const newBestScores = prev.bestScores.map(arr => [...arr]);
                newBestScores[selectedOpponent.id][currentLevel - 1] = Math.max(
                    newBestScores[selectedOpponent.id][currentLevel - 1] || 0,
                    finalScore
                );

                return {
                    ...prev,
                    levelStars: newLevelStars,
                    levelsBeat: newLevelsBeat,
                    bonusAchieved: newBonusAchieved,
                    bestScores: newBestScores,
                    totalTreasures: prev.totalTreasures + treasuresFound,
                    totalGames: prev.totalGames + 1
                };
            });
        }
    }, [gameState]);

    // Keyboard controls
    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Escape') {
                if (showTutorial) {
                    setShowTutorial(false);
                } else if (gameState === 'playing') {
                    setGameState('level_select');
                } else if (gameState !== 'menu') {
                    setGameState('menu');
                }
            }
            if (gameState === 'playing') {
                if (e.code === 'KeyR' && tools.radar > 0) useTool('radar');
                if (e.code === 'KeyX' && tools.xray > 0) useTool('xray');
                if (e.code === 'KeyS' && tools.sonar > 0) useTool('sonar');
                if (e.code === 'KeyF') useTool('flag');
                if (e.code === 'KeyH') getHint();
            }
            if (showTutorial && (e.code === 'Space' || e.code === 'Enter')) {
                if (tutorialStep < 4) {
                    setTutorialStep(s => s + 1);
                } else {
                    setShowTutorial(false);
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameState, showTutorial, tutorialStep, tools, useTool, getHint]);

    // Star bar component - shows 10 stars with half-star support
    const StarBar = ({ stars, size = 'normal' }) => {
        const starSizeNum = size === 'small' ? 12 : 16;
        const starSize = `${starSizeNum}px`;

        // Stars can be fractional (0-10 in 0.5 increments)
        const totalStars = Math.min(10, stars || 0);

        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {Array(10).fill(0).map((_, i) => {
                    const starValue = i + 1;
                    let fillPercent = 0;

                    if (totalStars >= starValue) {
                        fillPercent = 100; // Full star
                    } else if (totalStars >= starValue - 0.5) {
                        fillPercent = 50; // Half star
                    }

                    return (
                        <div key={i} style={{
                            width: starSize, height: starSize,
                            position: 'relative',
                            borderRadius: '2px',
                            background: theme.bgDark,
                            border: `1px solid ${fillPercent > 0 ? theme.gold : theme.border}`,
                            overflow: 'hidden'
                        }}>
                            {/* Filled portion */}
                            <div style={{
                                position: 'absolute',
                                left: 0, top: 0, bottom: 0,
                                width: `${fillPercent}%`,
                                background: theme.gold,
                                boxShadow: fillPercent > 0 ? `0 0 4px ${theme.goldGlow}` : 'none'
                            }} />
                        </div>
                    );
                })}
            </div>
        );
    };

    // Single star indicator for level buttons
    const LevelStar = ({ stars, size = 14 }) => {
        // 0 = empty, 0.5 = half, 1 = full
        const fillPercent = stars === 1 ? 100 : stars === 0.5 ? 50 : 0;

        if (stars === 0) return null;

        return (
            <div style={{
                width: size, height: size,
                position: 'relative',
                borderRadius: '50%',
                background: theme.bgDark,
                border: `1px solid ${theme.gold}`,
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    left: 0, top: 0, bottom: 0,
                    width: `${fillPercent}%`,
                    background: theme.gold
                }} />
            </div>
        );
    };

    // Tool button component
    const ToolButton = ({ name, icon, count, hotkey, active, onClick }) => (
        <button
            onClick={onClick}
            disabled={count <= 0}
            style={{
                padding: '8px 12px',
                background: active ? theme.accent : count > 0 ? theme.bgPanel : theme.bgDark,
                border: `2px solid ${active ? theme.accentBright : count > 0 ? theme.border : theme.bgDark}`,
                borderRadius: '8px',
                color: active ? '#1a1815' : count > 0 ? theme.text : theme.textMuted,
                cursor: count > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: active ? 'bold' : 'normal',
                transition: 'all 0.2s',
                opacity: count > 0 ? 1 : 0.5
            }}
        >
            <span style={{ fontSize: '18px' }}>{icon}</span>
            <span>{name}</span>
            <span style={{
                background: active ? '#1a1815' : theme.bgDark,
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '12px',
                color: active ? theme.accent : theme.textSecondary
            }}>
                {count} [{hotkey}]
            </span>
        </button>
    );

    // Tutorial overlay
    const TutorialOverlay = () => {
        const steps = [
            {
                title: 'Welcome to Treasure Dig!',
                content: 'Your goal is to find hidden treasure using distance clues. Each dig reveals how far you are from the nearest treasure.',
                icon: '💎'
            },
            {
                title: 'Distance Numbers',
                content: 'When you dig, you see a DISTANCE NUMBER. This tells you exactly how many tiles away the treasure is. Use multiple digs to triangulate!',
                icon: '📏'
            },
            {
                title: 'Triangulation Strategy',
                content: 'If one dig shows distance 3 and another shows distance 2, the treasure must be where those distances intersect. Think like a detective!',
                icon: '🎯'
            },
            {
                title: 'Tools & Flags',
                content: 'Use RADAR to scan rows/columns, X-RAY to peek without digging, and FLAGS to mark suspected locations. Tools are limited - use wisely!',
                icon: '🛠️'
            },
            {
                title: 'Ready to Dig!',
                content: 'Hot colors (red/orange) mean close. Cold colors (blue/purple) mean far. Find all treasures before running out of digs. Good luck!',
                icon: '⛏️'
            }
        ];

        const step = steps[tutorialStep];

        return (
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
                <div style={{
                    background: theme.bgPanel,
                    border: `3px solid ${theme.accent}`,
                    borderRadius: '20px',
                    padding: '40px',
                    maxWidth: '500px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>{step.icon}</div>
                    <h2 style={{ color: theme.accent, marginBottom: '15px' }}>{step.title}</h2>
                    <p style={{ color: theme.textSecondary, lineHeight: '1.6', marginBottom: '30px' }}>
                        {step.content}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                        {steps.map((_, i) => (
                            <div key={i} style={{
                                width: '12px', height: '12px',
                                borderRadius: '50%',
                                background: i === tutorialStep ? theme.accent : theme.border
                            }} />
                        ))}
                    </div>

                    <button
                        onClick={() => tutorialStep < 4 ? setTutorialStep(s => s + 1) : setShowTutorial(false)}
                        style={{
                            padding: '12px 40px',
                            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                            border: 'none',
                            borderRadius: '10px',
                            color: '#1a1815',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        {tutorialStep < 4 ? 'Next →' : 'Start Digging!'}
                    </button>
                    <div style={{ marginTop: '10px', color: theme.textMuted, fontSize: '12px' }}>
                        Press SPACE or ENTER to continue
                    </div>
                </div>
            </div>
        );
    };

    // MENU SCREEN
    if (gameState === 'menu') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2a2515 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                <div style={{ fontSize: '80px', marginBottom: '10px', animation: 'bounce 2s infinite' }}>💎</div>
                <h1 style={{ fontSize: '42px', marginBottom: '5px', color: theme.accent, textShadow: `0 0 20px ${theme.goldGlow}` }}>
                    TREASURE DIG
                </h1>
                <p style={{ color: theme.textSecondary, marginBottom: '10px', fontSize: '18px' }}>
                    Find hidden treasure using logic and deduction!
                </p>
                <p style={{ color: theme.textMuted, marginBottom: '30px', fontSize: '14px', maxWidth: '400px', textAlign: 'center' }}>
                    Dig tiles to reveal distance numbers. Triangulate the treasure location. Use tools wisely!
                </p>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '18px 60px', fontSize: '22px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '12px', color: '#1a1815',
                        cursor: 'pointer', fontWeight: 'bold',
                        boxShadow: `0 4px 20px ${theme.goldGlow}`,
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                >
                    START EXPEDITION
                </button>

                {progression.totalGames > 0 && (
                    <div style={{
                        marginTop: '30px',
                        padding: '15px 25px',
                        background: theme.bgPanel,
                        borderRadius: '10px',
                        display: 'flex',
                        gap: '30px'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: theme.gold, fontSize: '24px', fontWeight: 'bold' }}>
                                {progression.totalTreasures}
                            </div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>Treasures Found</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: theme.accent, fontSize: '24px', fontWeight: 'bold' }}>
                                {progression.totalGames}
                            </div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>Games Played</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: theme.success, fontSize: '24px', fontWeight: 'bold' }}>
                                {opponents.reduce((total, _, idx) => total + getStars(idx), 0)}/100
                            </div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>Total Stars</div>
                        </div>
                    </div>
                )}

                <a href="../menu.html" style={{
                    marginTop: '30px', color: theme.textMuted,
                    textDecoration: 'none', fontSize: '14px'
                }}>← Back to Main Menu</a>

                <style>{`
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                `}</style>
            </div>
        );
    }

    // SELECT SCREEN
    if (gameState === 'select') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2a2515 100%)`,
                padding: '20px', color: theme.text
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setGameState('menu')} style={{
                        background: 'transparent', border: `1px solid ${theme.border}`,
                        color: theme.textSecondary, padding: '10px 20px', borderRadius: '8px', cursor: 'pointer'
                    }}>← Back</button>
                    <h2 style={{ color: theme.accent, fontSize: '24px' }}>Choose Your Expedition</h2>
                    <div style={{ width: '100px' }} />
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '15px', maxWidth: '1400px', margin: '0 auto'
                }}>
                    {opponents.map((opp, idx) => {
                        const unlocked = isOpponentUnlocked(idx);
                        const mastered = isOpponentMastered(idx);
                        const starsEarned = getStars(idx);

                        return (
                            <div
                                key={opp.id}
                                onClick={() => {
                                    if (unlocked) {
                                        setSelectedOpponent(opp);
                                        setGameState('level_select');
                                    }
                                }}
                                style={{
                                    background: unlocked
                                        ? `linear-gradient(135deg, ${theme.bgPanel}, ${theme.bgDark})`
                                        : theme.bgDark,
                                    border: `2px solid ${unlocked ? opp.color : theme.border}`,
                                    borderRadius: '15px',
                                    padding: '20px',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5,
                                    transition: 'all 0.3s',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    if (unlocked) {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = `0 8px 25px ${opp.color}33`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {!unlocked && (
                                    <div style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        background: theme.bgDark,
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        color: theme.textMuted,
                                        border: `1px solid ${theme.border}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <span>🔒</span>
                                        <span>{10 - getStars(idx - 1)}★ needed</span>
                                    </div>
                                )}
                                {mastered && (
                                    <div style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        background: `linear-gradient(135deg, ${theme.gold}, ${theme.accentBright})`,
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        color: '#1a1815'
                                    }}>⭐ MASTERED</div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                                    <div style={{
                                        fontSize: '52px',
                                        width: '80px', height: '80px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `${opp.color}22`,
                                        borderRadius: '50%',
                                        border: `2px solid ${opp.color}44`,
                                        flexShrink: 0
                                    }}>{opp.emoji}</div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '20px', fontWeight: 'bold', color: opp.color,
                                            marginBottom: '2px'
                                        }}>{opp.name}</div>
                                        <div style={{
                                            fontSize: '12px', color: theme.textMuted, marginBottom: '8px'
                                        }}>{opp.title}</div>

                                        <div style={{
                                            fontSize: '12px', color: theme.textSecondary,
                                            background: `${opp.color}15`,
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            marginBottom: '10px',
                                            borderLeft: `3px solid ${opp.color}`
                                        }}>
                                            {opp.mechanic}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <StarBar stars={starsEarned} size="small" />
                                            <span style={{ color: theme.textMuted, fontSize: '11px' }}>
                                                {starsEarned}/10 ⭐
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '12px',
                                    paddingTop: '12px',
                                    borderTop: `1px solid ${theme.border}`,
                                    display: 'flex',
                                    gap: '15px',
                                    fontSize: '11px',
                                    color: theme.textMuted
                                }}>
                                    <span>📐 {opp.gridSize}x{opp.gridSize}</span>
                                    <span>⛏️ {opp.baseDigs} digs</span>
                                    <span>💎 {opp.treasures} treasure{opp.treasures > 1 ? 's' : ''}</span>
                                    {opp.decoys > 0 && <span>💀 {opp.decoys} decoy{opp.decoys > 1 ? 's' : ''}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // LEVEL SELECT SCREEN
    if (gameState === 'level_select' && selectedOpponent) {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${selectedOpponent.color}15 100%)`,
                padding: '20px', color: theme.text,
                display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <button onClick={() => setGameState('select')} style={{
                    alignSelf: 'flex-start',
                    background: 'transparent', border: `1px solid ${theme.border}`,
                    color: theme.textSecondary, padding: '10px 20px', borderRadius: '8px', cursor: 'pointer'
                }}>← Back</button>

                <div style={{
                    fontSize: '100px', marginTop: '20px',
                    filter: 'drop-shadow(0 0 20px ' + selectedOpponent.color + ')'
                }}>{selectedOpponent.emoji}</div>
                <h2 style={{ color: selectedOpponent.color, marginTop: '10px', fontSize: '32px' }}>
                    {selectedOpponent.name}
                </h2>
                <p style={{ color: theme.textMuted, marginBottom: '10px' }}>{selectedOpponent.title}</p>

                <div style={{
                    marginTop: '10px', padding: '15px 25px',
                    background: `${selectedOpponent.color}15`,
                    borderRadius: '12px',
                    color: theme.textSecondary,
                    maxWidth: '500px',
                    textAlign: 'center',
                    border: `1px solid ${selectedOpponent.color}33`
                }}>
                    <div style={{ fontWeight: 'bold', color: selectedOpponent.color, marginBottom: '5px' }}>
                        Special Mechanic:
                    </div>
                    {selectedOpponent.description}
                </div>

                <div style={{ marginTop: '20px' }}>
                    <StarBar stars={getStars(selectedOpponent.id)} />
                    <div style={{ textAlign: 'center', marginTop: '5px', color: theme.textMuted, fontSize: '12px' }}>
                        {getStars(selectedOpponent.id)}/10 stars earned
                    </div>
                </div>

                <h3 style={{ marginTop: '30px', marginBottom: '15px', color: theme.textSecondary }}>
                    Select Level
                </h3>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '12px', maxWidth: '450px'
                }}>
                    {Array(10).fill(0).map((_, i) => {
                        const levelNum = i + 1;
                        const unlocked = isLevelUnlocked(selectedOpponent.id, levelNum);
                        const beaten = progression.levelsBeat[selectedOpponent.id]?.[i];
                        const levelStar = getLevelStar(selectedOpponent.id, levelNum);
                        const hasBonus = progression.bonusAchieved?.[selectedOpponent.id]?.[i] || false;

                        // Star colors: gold for full, half gold for half star
                        const starBg = levelStar === 1 ? theme.gold :
                                       levelStar === 0.5 ? `linear-gradient(90deg, ${theme.gold} 50%, ${theme.bgDark} 50%)` :
                                       theme.bgDark;

                        return (
                            <button
                                key={i}
                                onClick={() => unlocked && startMatch(selectedOpponent, levelNum)}
                                disabled={!unlocked}
                                style={{
                                    width: '75px', height: '75px',
                                    background: beaten
                                        ? `linear-gradient(135deg, ${levelStar === 1 ? theme.gold : theme.success}44, ${theme.bgPanel})`
                                        : unlocked
                                            ? `linear-gradient(135deg, ${selectedOpponent.color}88, ${selectedOpponent.color}44)`
                                            : theme.bgDark,
                                    border: `2px solid ${levelStar === 1 ? theme.gold : beaten ? theme.success : unlocked ? selectedOpponent.color : theme.border}`,
                                    borderRadius: '12px',
                                    color: unlocked ? 'white' : theme.textMuted,
                                    fontSize: '20px', fontWeight: 'bold',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'transform 0.2s',
                                    position: 'relative'
                                }}
                                onMouseEnter={e => unlocked && (e.currentTarget.style.transform = 'scale(1.08)')}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {unlocked ? (
                                    <>
                                        {levelNum}
                                        {/* Star indicator */}
                                        {beaten && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '2px'
                                            }}>
                                                <div style={{
                                                    width: '14px', height: '14px',
                                                    borderRadius: '50%',
                                                    border: `1px solid ${theme.gold}`,
                                                    background: starBg,
                                                    boxShadow: levelStar > 0 ? `0 0 4px ${theme.goldGlow}` : 'none'
                                                }} />
                                            </div>
                                        )}
                                    </>
                                ) : '🔒'}
                            </button>
                        );
                    })}
                </div>

                {/* Level info: show bonus objective for next unbeaten level or completion message */}
                {(() => {
                    // Find first unbeaten level
                    const nextLevel = Array(10).fill(0).findIndex((_, i) =>
                        isLevelUnlocked(selectedOpponent.id, i + 1) && !progression.levelsBeat[selectedOpponent.id]?.[i]
                    );
                    const worldStars = getStars(selectedOpponent.id);
                    const isMastered = worldStars >= 10;

                    // All levels beaten
                    if (nextLevel === -1) {
                        return (
                            <div style={{
                                marginTop: '20px',
                                padding: '15px 25px',
                                background: isMastered
                                    ? `linear-gradient(135deg, ${theme.gold}33, ${theme.bgPanel})`
                                    : theme.bgPanel,
                                borderRadius: '12px',
                                textAlign: 'center',
                                maxWidth: '400px',
                                border: isMastered ? `2px solid ${theme.gold}` : 'none'
                            }}>
                                {isMastered ? (
                                    <>
                                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>👑</div>
                                        <div style={{ color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>
                                            WORLD MASTERED!
                                        </div>
                                        <div style={{ color: theme.textSecondary, fontSize: '12px', marginTop: '5px' }}>
                                            All 10 stars collected - You've unlocked the next world!
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</div>
                                        <div style={{ color: theme.success, fontSize: '16px', fontWeight: 'bold' }}>
                                            All Levels Complete!
                                        </div>
                                        <div style={{ color: theme.textSecondary, fontSize: '12px', marginTop: '5px' }}>
                                            You have {worldStars}/10★ - Replay levels to earn bonus stars and unlock the next world!
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    }

                    const config = getLevelConfig(selectedOpponent, nextLevel + 1);
                    return (
                        <div style={{
                            marginTop: '20px',
                            padding: '12px 20px',
                            background: theme.bgPanel,
                            borderRadius: '10px',
                            textAlign: 'center',
                            maxWidth: '400px'
                        }}>
                            <div style={{ color: theme.textSecondary, fontSize: '12px', marginBottom: '5px' }}>
                                Level {nextLevel + 1} Bonus Objective:
                            </div>
                            <div style={{ color: theme.gold, fontSize: '14px', fontWeight: 'bold' }}>
                                ⭐ {config.bonusObjective?.desc}
                            </div>
                            <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '5px' }}>
                                Complete level = ½ star | Bonus = full star
                            </div>
                        </div>
                    );
                })()}

                {selectedOpponent.tutorial && (
                    <button
                        onClick={() => {
                            setShowTutorial(true);
                            setTutorialStep(0);
                        }}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: 'transparent',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '8px',
                            color: theme.textMuted,
                            cursor: 'pointer'
                        }}
                    >
                        📖 View Tutorial
                    </button>
                )}
            </div>
        );
    }

    // PLAYING SCREEN - JRPG THREE-COLUMN LAYOUT
    if (gameState === 'playing' && grid.length > 0) {
        const opp = selectedOpponent;
        // Board takes up 50-65% of screen height - calculate tile size accordingly
        const boardHeightTarget = Math.min(window.innerHeight * 0.6, 550);
        const tileSize = Math.min(48, Math.max(36, Math.floor((boardHeightTarget - 40) / gridSize)));
        const hasFog = opp?.special.includes('fog');
        const treasureCount = levelConfig?.treasures || opp?.treasures || 1;

        // Get world theme for background
        const wTheme = currentTheme || worldThemes[opp?.id || 0];
        const bgColors = wTheme?.bgGradient || [theme.bg, theme.bgPanel, theme.bg];
        const levelVariation = isLateLevel ? wTheme?.variation?.late : wTheme?.variation?.early;

        // Current mode color for UI accents
        const currentModeColor = getCurrentModeColor(gamePhase);
        const worldScanTheme = worldScanThemes[opp?.id || 0] || worldScanThemes[0];

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(180deg, ${theme.bgDark} 0%, ${theme.bg} 50%, ${theme.bgDark} 100%)`,
                display: 'flex', flexDirection: 'column',
                padding: '12px 20px', color: theme.text, userSelect: 'none',
                transform: screenShake ? 'translateX(3px)' : 'none',
                transition: 'transform 0.05s',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Mechanic Alert Popup - shows world-specific alerts */}
                <MechanicAlertPopup alert={mechanicAlert} />

                {/* Ambient floating particles - more subtle */}
                {ambientParticles.map((p, idx) => (
                    <div
                        key={p.id}
                        style={{
                            position: 'absolute',
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            fontSize: '16px',
                            opacity: 0.08 + (idx % 3) * 0.05,
                            pointerEvents: 'none',
                            animation: `float-${idx % 3} ${10 + p.speed * 4}s infinite ease-in-out`,
                            zIndex: 0
                        }}
                    >
                        {p.emoji}
                    </div>
                ))}

                {/* === SLIM HEADER === */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '12px', padding: '8px 16px',
                    background: theme.bgPanel, borderRadius: '8px',
                    border: `1px solid ${theme.border}`
                }}>
                    {/* Left: World/Level info with frog mascot */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FrogMascot mood={mascotMood} />
                        <div>
                            <div style={{ color: opp?.color || theme.accent, fontWeight: 'bold', fontSize: '14px' }}>
                                {opp?.emoji} {opp?.name}
                            </div>
                            <div style={{ fontSize: '11px', color: theme.textMuted }}>
                                {wTheme.name} • {levelVariation} • Lv.{currentLevel}
                            </div>
                        </div>
                    </div>
                    {/* Right: ESC button */}
                    <button
                        onClick={() => setGameState('level_select')}
                        style={{
                            background: 'transparent', border: `1px solid ${theme.border}`,
                            color: theme.textMuted, padding: '6px 14px', borderRadius: '6px',
                            cursor: 'pointer', fontSize: '11px', fontWeight: 'bold'
                        }}
                    >ESC</button>
                </div>

                {/* Tutorial overlay */}
                {showTutorial && <TutorialOverlay />}

                {/* === MAIN THREE-COLUMN LAYOUT - only during prospect/dig phases === */}
                {(gamePhase === 'prospect' || gamePhase === 'dig') && (
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    flex: 1,
                    alignItems: 'flex-start',
                    justifyContent: 'center'
                }}>
                    {/* === LEFT COLUMN: Status === */}
                    <StatusColumn
                        digs={gamePhase === 'prospect' ? scansRemaining : digsRemaining}
                        score={score}
                        treasuresFound={treasuresFound}
                        treasureCount={treasureCount}
                        combo={combo}
                        friends={friendsFound}
                        objective={levelConfig?.bonusObjective?.desc}
                        modeColor={currentModeColor}
                        phase={gamePhase}
                    />

                    {/* === CENTER COLUMN: Board with ornate frame === */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        {/* Phase Banner - compact indicator */}
                        <PhaseBanner
                            phase={gamePhase === 'prospect' ? 'PROSPECT' : gamePhase === 'dig' ? 'DIG' : gamePhase.toUpperCase()}
                            modeColor={currentModeColor}
                            message={gamePhase === 'prospect' ? 'Scan to detect • Right-click to mark' : gamePhase === 'dig' ? 'Click marked tiles to excavate' : ''}
                            stats={gamePhase === 'prospect' ? [
                                { icon: worldScanTheme.toolEmoji, value: scansRemaining, color: scansRemaining > 3 ? theme.success : theme.error },
                                { icon: '⛏️', value: markedTiles.length, color: theme.modeMark }
                            ] : gamePhase === 'dig' ? [
                                { icon: '⛏️', value: digsRemaining, color: digsRemaining > 2 ? theme.success : theme.error },
                                { icon: '📦', value: excavatedItems.length, color: theme.gold }
                            ] : null}
                        />

                        {/* World Mechanic Panel - shows world-specific mechanic status */}
                        <MechanicPanel
                            worldId={opp?.id || 0}
                            mechanicState={{
                                triangulationScans,
                                peckMeter,
                                peckThreshold,
                                scanMode,
                                roarCounter,
                                chargeLevel,
                                maxCharge,
                                fogTiles,
                                lanternActive,
                                coldTimer,
                                iceCracks,
                                shiftCounter,
                                anchorTiles,
                                tileDepths
                            }}
                            onToggleScanMode={(mode) => setScanMode(mode)}
                        />

                        {/* Last scan/dig feedback - only during prospect/dig phases */}
                        {lastDigResult && (gamePhase === 'prospect' || gamePhase === 'dig') && (
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                                padding: '8px 24px', borderRadius: '20px',
                                background: `${lastDigResult.color}18`,
                                border: `2px solid ${lastDigResult.color}`,
                                animation: lastDigResult.tier <= 2 ? 'pulse 0.5s' : 'fadeIn 0.3s'
                            }}>
                                <span style={{ fontSize: '28px' }}>{lastDigResult.emoji}</span>
                                <span style={{
                                    color: lastDigResult.color,
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    textShadow: lastDigResult.tier <= 2 ? `0 0 8px ${lastDigResult.color}` : 'none'
                                }}>
                                    {lastDigResult.label}
                                </span>
                            </div>
                        )}

                        {/* The Board with ornate JRPG frame */}
                        {(gamePhase === 'prospect' || gamePhase === 'dig') && (
                            <OrnateFrame
                                modeColor={currentModeColor}
                                title={worldScanTheme.tool}
                                subtitle={`${gridSize}×${gridSize}`}
                            >
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${gridSize}, ${tileSize}px)`,
                                    gap: '2px',
                                    padding: '10px',
                                    background: 'transparent',
                                    position: 'relative'
                                }}>
                                    {grid.map((row, y) =>
                                        row.map((tile, x) => {
                                            const isDug = tile.dug;
                                            const isFrozen = frozenTiles.some(f => f.x === x && f.y === y) && !isDug;
                                            const isFlagged = tile.flagged;
                                            const isRevealed = tile.revealed || revealedTiles.some(r => r.x === x && r.y === y);
                                            const sonarTile = sonarTiles.find(s => s.x === x && s.y === y);
                                            const isHinted = showHint && hintTile?.x === x && hintTile?.y === y;

                                            // PHASE SYSTEM: Check scan status and marks
                                            const tileKey = `${x}_${y}`;
                                            const scanResult = signalStrengths[tileKey];
                                            const isMarked = markedTiles.some(m => m.x === x && m.y === y);
                                            const isScanned = scanResult !== undefined;

                                            // Fog visibility
                                            const fogOpacity = hasFog && !isDug && !isRevealed ? 0.15 : 1;

                                            // Deep dig indicator
                                            const isDeepPartial = tile.dugDepth > 0 && tile.dugDepth < tile.requiredDepth;

                                            // Special tile indicator
                                            const isSpecialTile = tile.specialType && !isDug;
                                            const isIlluminated = illuminatedTiles.some(t => t.x === x && t.y === y);

                                            // Get world-themed colors
                                            const tileWorldTheme = currentTheme || worldThemes[0];
                                            const baseTileColor = tileWorldTheme.tileBase;
                                            const dugTileColor = tileWorldTheme.tileDug;

                                            // Tile colors - use world theme
                                            let bgColor = baseTileColor;
                                            let borderColor = tileWorldTheme.tileAccent;
                                            let content = null;
                                            let specialIndicator = null;

                                            // Add special tile indicator
                                            if (isSpecialTile) {
                                                bgColor = tileWorldTheme.tileSpecial;
                                                borderColor = tileWorldTheme.specialBorder;
                                                specialIndicator = (
                                                    <span style={{
                                                        fontSize: tileSize * 0.45,
                                                        textShadow: `0 0 6px ${tileWorldTheme.specialBorder}`,
                                                        animation: 'pulse 2s infinite'
                                                    }}>
                                                        {tileWorldTheme.specialEmoji}
                                                    </span>
                                                );
                                            }

                                            if (isDug) {
                                                bgColor = tile.distanceInfo?.color || dugTileColor;
                                                borderColor = tile.distanceInfo?.color || tileWorldTheme.tileAccent;
                                                content = (
                                                    <span style={{
                                                        fontSize: tileSize * 0.5,
                                                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                                                    }}>
                                                        {tile.distanceInfo?.emoji || '❓'}
                                                    </span>
                                                );
                                                specialIndicator = null;
                                            } else if (isDeepPartial) {
                                                bgColor = dugTileColor;
                                                content = <span style={{ fontSize: tileSize * 0.4 }}>🕳️</span>;
                                            } else if (isFlagged) {
                                                bgColor = tileWorldTheme.tileAccent;
                                                borderColor = theme.success;
                                                content = <span style={{ fontSize: tileSize * 0.45 }}>🚩</span>;
                                            } else if (isFrozen) {
                                                bgColor = '#aaddff';
                                                borderColor = '#88bbdd';
                                                content = <span style={{ fontSize: tileSize * 0.4 }}>❄️</span>;
                                            }

                                            // Illuminated tiles
                                            if (isIlluminated && !isDug) {
                                                borderColor = '#ffee88';
                                            }

                                            // Sonar overlay
                                            if (sonarTile) {
                                                const sonarInfo = sonarTile.info || getDistanceInfo(sonarTile.distance, gridSize);
                                                borderColor = sonarInfo.color;
                                            }

                                            // Hint highlight
                                            if (isHinted) {
                                                borderColor = theme.gold;
                                                bgColor = `${theme.gold}44`;
                                            }

                                            // Phase-specific visuals
                                            let phaseOverlay = null;

                                            // PROSPECT PHASE: Show scan results with mode-colored glow
                                            if (gamePhase === 'prospect' && isScanned && !isDug) {
                                                const strength = scanResult.strength;
                                                const signalColor = strength >= 2.5 ? theme.signalStrong
                                                    : strength >= 1.5 ? theme.signalMedium
                                                    : strength >= 0.5 ? theme.signalWeak
                                                    : theme.signalNone;
                                                bgColor = `${signalColor}33`;
                                                borderColor = signalColor;
                                                content = (
                                                    <span style={{
                                                        fontSize: tileSize * 0.4,
                                                        textShadow: `0 0 4px ${signalColor}`,
                                                        animation: strength >= 2.5 ? 'pulse 1s infinite' : 'none'
                                                    }}>
                                                        {strength >= 2.5 ? '📡' : strength >= 1.5 ? '📶' : strength >= 0.5 ? '〰️' : '·'}
                                                    </span>
                                                );
                                            }

                                            // Marked tiles with mode-colored styling
                                            if (isMarked && !isDug) {
                                                borderColor = theme.modeMark;
                                                phaseOverlay = (
                                                    <div style={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        border: `2px solid ${theme.modeMark}`,
                                                        borderRadius: '4px',
                                                        boxShadow: `0 0 8px ${theme.modeMarkGlow}, inset 0 0 8px ${theme.modeMarkGlow}`,
                                                        pointerEvents: 'none'
                                                    }}>
                                                        <span style={{
                                                            position: 'absolute',
                                                            top: -6, right: -6,
                                                            fontSize: '12px',
                                                            background: theme.bgDark,
                                                            borderRadius: '50%',
                                                            padding: '1px'
                                                        }}>⛏️</span>
                                                    </div>
                                                );
                                            }

                                            // DIG PHASE: Show excavated items
                                            if (gamePhase === 'dig' && isDug) {
                                                const hiddenItem = hiddenContents[tileKey];
                                                if (hiddenItem) {
                                                    bgColor = hiddenItem.isDirt ? '#6a4a2a' : '#3a5a3a';
                                                    content = (
                                                        <span style={{ fontSize: tileSize * 0.45 }}>
                                                            {hiddenItem.isDirt ? '🟤' : hiddenItem.emoji}
                                                        </span>
                                                    );
                                                } else {
                                                    bgColor = dugTileColor;
                                                    content = <span style={{ fontSize: tileSize * 0.3, opacity: 0.5 }}>∅</span>;
                                                }
                                            }

                                            return (
                                                <div
                                                    key={`${x}-${y}`}
                                                    onClick={() => handleDig(x, y)}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        if (gamePhase === 'prospect') {
                                                            handleMark(x, y);
                                                        } else {
                                                            handleFlag(x, y);
                                                        }
                                                    }}
                                                    style={{
                                                        width: tileSize,
                                                        height: tileSize,
                                                        background: bgColor,
                                                        border: `2px solid ${borderColor}`,
                                                        borderRadius: '4px',
                                                        cursor: isDug && !isDeepPartial ? 'default' : (gamePhase === 'prospect' ? 'crosshair' : 'pointer'),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.12s',
                                                        opacity: fogOpacity,
                                                        boxShadow: sonarTile
                                                            ? `0 0 ${sonarFading ? '4px' : '10px'} ${sonarTile.info?.color || theme.accent}`
                                                            : isHinted
                                                                ? `0 0 12px ${theme.gold}`
                                                                : isDug
                                                                    ? 'inset 0 2px 4px rgba(0,0,0,0.3)'
                                                                    : '0 2px 4px rgba(0,0,0,0.2)',
                                                        position: 'relative'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isDug || isDeepPartial) {
                                                            e.currentTarget.style.transform = 'scale(1.06)';
                                                            e.currentTarget.style.zIndex = '10';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                        e.currentTarget.style.zIndex = '1';
                                                    }}
                                                >
                                                    {content}
                                                    {specialIndicator}
                                                    {phaseOverlay}
                                                </div>
                                            );
                                        })
                                    )}
                                    {/* Hit effects overlay */}
                                    {hitEffects.map(e => (
                                        <div
                                            key={e.id}
                                            style={{
                                                position: 'absolute',
                                                left: e.x * (tileSize + 2) + tileSize / 2 + 10,
                                                top: e.y * (tileSize + 2) + tileSize / 2 + 10,
                                                transform: 'translate(-50%, -50%)',
                                                fontSize: e.type === 'treasure' ? '18px' : '14px',
                                                fontWeight: 'bold',
                                                color: e.type === 'treasure' ? theme.gold
                                                    : e.type === 'decoy' ? theme.error
                                                    : e.type === 'friend' ? theme.success
                                                    : theme.text,
                                                pointerEvents: 'none',
                                                animation: 'floatUp 1.2s ease-out forwards',
                                                zIndex: 100,
                                                textShadow: '0 0 6px black',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {e.text}
                                        </div>
                                    ))}
                                </div>
                            </OrnateFrame>
                        )}

                        {/* Phase Action Buttons - below the frame */}
                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            {gamePhase === 'prospect' && (
                                <>
                                    <button
                                        onClick={startDigPhase}
                                        disabled={markedTiles.length === 0}
                                        style={{
                                            padding: '10px 24px',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            background: markedTiles.length > 0
                                                ? `linear-gradient(135deg, ${theme.modeDig} 0%, ${theme.modeDig}cc 100%)`
                                                : '#444',
                                            color: '#fff',
                                            border: markedTiles.length > 0 ? `2px solid ${theme.modeDig}` : '2px solid #555',
                                            borderRadius: '8px',
                                            cursor: markedTiles.length > 0 ? 'pointer' : 'not-allowed',
                                            boxShadow: markedTiles.length > 0 ? `0 4px 12px ${theme.modeDigGlow}` : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        ⛏️ Ready to Dig ({markedTiles.length})
                                    </button>
                                    <button
                                        onClick={skipToDigPhase}
                                        style={{
                                            padding: '8px 16px',
                                            fontSize: '12px',
                                            background: 'transparent',
                                            color: theme.textMuted,
                                            border: `1px solid ${theme.border}`,
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Skip Scanning
                                    </button>
                                </>
                            )}
                            {gamePhase === 'dig' && excavatedItems.length > 0 && (
                                <button
                                    onClick={() => {
                                        setGamePhase('sort');
                                        setLastDigResult(null); // Clear scan feedback
                                        setPhaseMessage('🧺 SORT PHASE - Choose what to keep!');
                                        addEventLog('Moving to sort phase...');
                                    }}
                                    style={{
                                        padding: '10px 24px',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        background: `linear-gradient(135deg, ${theme.gold} 0%, ${theme.accent} 100%)`,
                                        color: theme.bgDark,
                                        border: `2px solid ${theme.gold}`,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        boxShadow: `0 4px 12px ${theme.goldGlow}`
                                    }}
                                >
                                    🧺 Done Digging ({excavatedItems.length} items)
                                </button>
                            )}
                        </div>
                    </div>

                    {/* === RIGHT COLUMN: Commands, Bag, Log === */}
                    <div style={{ width: '170px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Command Menu */}
                        <CommandMenu
                            activeMode={activeMode}
                            onModeClick={(mode) => setActiveMode(mode)}
                            scansLeft={scansRemaining}
                            markedCount={markedTiles.length}
                            digsLeft={digsRemaining}
                            phase={gamePhase}
                        />

                        {/* Bag Panel */}
                        <BagPanel
                            items={excavatedItems}
                            capacity={BASKET_CAPACITY}
                            onItemClick={(item) => addEventLog(`Inspecting ${item.displayName || item.name}...`)}
                        />

                        {/* Event Log */}
                        <EventLog events={eventLog} />
                    </div>
                </div>
                )}

                {/* ========================================== */}
                {/* PACKUP PHASE - Full-screen Workbench UI */}
                {/* ========================================== */}
                {gamePhase === 'sort' && excavatedItems.length > 0 && (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        padding: '0 20px'
                    }}>
                        {/* Phase Ribbon - centered status bar */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '20px',
                            padding: '10px 24px',
                            background: `linear-gradient(90deg, transparent 0%, ${theme.gold}15 50%, transparent 100%)`,
                            borderRadius: '20px',
                            border: `1px solid ${theme.gold}40`
                        }}>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: theme.gold }}>
                                🧺 PACKUP
                            </span>
                            <span style={{ color: theme.textSecondary, fontSize: '13px' }}>
                                {selectedForBasket.length}/{BASKET_CAPACITY} kept
                            </span>
                            <span style={{ color: theme.textMuted, fontSize: '13px' }}>•</span>
                            <span style={{ color: theme.textSecondary, fontSize: '13px' }}>
                                {excavatedItems.length - selectedForBasket.length} on table
                            </span>
                            {levelConfig?.bonusObjective && (
                                <>
                                    <span style={{ color: theme.textMuted, fontSize: '13px' }}>•</span>
                                    <span style={{ color: theme.gold, fontSize: '12px' }}>
                                        ⭐ {levelConfig.bonusObjective.desc}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Main Workbench - dominant 2-pane layout */}
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            gap: '16px',
                            minHeight: '400px',
                            maxHeight: '65vh'
                        }}>
                            {/* LEFT PANEL: Excavation Table (60%) */}
                            <div style={{
                                flex: '1.5',
                                display: 'flex',
                                flexDirection: 'column',
                                background: `linear-gradient(180deg, ${theme.bgPanel} 0%, ${theme.bgDark} 100%)`,
                                border: `3px solid ${theme.frameBrass}`,
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 ${theme.frameBrassLight}`
                            }}>
                                {/* Table Header */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    background: `linear-gradient(90deg, ${theme.frameBrassDark} 0%, ${theme.frameBrass} 50%, ${theme.frameBrassDark} 100%)`,
                                    borderBottom: `2px solid ${theme.frameBrassDark}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '20px' }}>🪨</span>
                                        <span style={{ color: theme.text, fontWeight: 'bold', fontSize: '14px' }}>
                                            Excavation Table
                                        </span>
                                        <span style={{
                                            background: theme.bgDark,
                                            padding: '2px 10px',
                                            borderRadius: '10px',
                                            fontSize: '12px',
                                            color: theme.textSecondary
                                        }}>
                                            {excavatedItems.filter(i => !selectedForBasket.includes(i.id)).length} items
                                        </span>
                                    </div>
                                    {/* Quick action: Auto-Pack Best */}
                                    <button
                                        onClick={() => {
                                            // Auto-pack highest value items first
                                            const unselected = excavatedItems.filter(i => !selectedForBasket.includes(i.id));
                                            const sorted = [...unselected].sort((a, b) => (b.points || 0) - (a.points || 0));
                                            const slotsAvailable = BASKET_CAPACITY - selectedForBasket.length;
                                            const toPack = sorted.slice(0, slotsAvailable).map(i => i.id);
                                            setSelectedForBasket(prev => [...prev, ...toPack]);
                                            addEventLog(`Auto-packed ${toPack.length} best items`);
                                        }}
                                        disabled={selectedForBasket.length >= BASKET_CAPACITY || excavatedItems.filter(i => !selectedForBasket.includes(i.id)).length === 0}
                                        style={{
                                            padding: '6px 12px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            background: theme.success,
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            opacity: selectedForBasket.length >= BASKET_CAPACITY ? 0.5 : 1
                                        }}
                                    >
                                        ⚡ Auto-Pack Best
                                    </button>
                                </div>

                                {/* Items Grid */}
                                <div style={{
                                    flex: 1,
                                    padding: '16px',
                                    overflowY: 'auto',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                    gap: '12px',
                                    alignContent: 'flex-start'
                                }}>
                                    {excavatedItems.filter(item => !selectedForBasket.includes(item.id)).map(item => {
                                        // Determine rarity for frame color
                                        const rarity = item.points >= 50 ? 'legendary' : item.points >= 20 ? 'rare' : item.points >= 10 ? 'uncommon' : 'common';
                                        const rarityColors = {
                                            legendary: { border: '#ffd700', glow: 'rgba(255,215,0,0.4)', bg: '#4a4020' },
                                            rare: { border: '#a78bfa', glow: 'rgba(167,139,250,0.3)', bg: '#3a3050' },
                                            uncommon: { border: '#22c55e', glow: 'rgba(34,197,94,0.2)', bg: '#2a4030' },
                                            common: { border: theme.border, glow: 'none', bg: theme.bgFrameInner }
                                        };
                                        const rc = rarityColors[rarity];

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => {
                                                    if (selectedForBasket.length < BASKET_CAPACITY) {
                                                        toggleItemSelection(item.id);
                                                        addEventLog(`Added ${item.displayName || 'item'} to basket`);
                                                    }
                                                }}
                                                style={{
                                                    aspectRatio: '1',
                                                    background: item.isDirt
                                                        ? 'radial-gradient(circle, #6a4a2a 30%, #4a3020 100%)'
                                                        : `radial-gradient(circle, ${rc.bg} 30%, ${theme.bgDark} 100%)`,
                                                    border: `3px solid ${rc.border}`,
                                                    borderRadius: '10px',
                                                    cursor: selectedForBasket.length >= BASKET_CAPACITY ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '4px',
                                                    boxShadow: rc.glow !== 'none' ? `0 0 12px ${rc.glow}, inset 0 -2px 8px rgba(0,0,0,0.3)` : 'inset 0 -2px 8px rgba(0,0,0,0.3)',
                                                    transition: 'all 0.15s',
                                                    position: 'relative',
                                                    opacity: selectedForBasket.length >= BASKET_CAPACITY ? 0.5 : 1
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (selectedForBasket.length < BASKET_CAPACITY) {
                                                        e.currentTarget.style.transform = 'scale(1.08) translateY(-4px)';
                                                        e.currentTarget.style.boxShadow = `0 8px 20px rgba(0,0,0,0.4), 0 0 15px ${rc.glow}`;
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.boxShadow = rc.glow !== 'none' ? `0 0 12px ${rc.glow}` : 'none';
                                                }}
                                                title={item.isDirt ? '🟤 Mystery dirt clump - could be treasure or junk!' : `${item.displayName} (${item.points || '?'} pts)`}
                                            >
                                                <span style={{
                                                    fontSize: '32px',
                                                    filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.5))'
                                                }}>
                                                    {item.displayEmoji}
                                                </span>
                                                {!item.isDirt && (
                                                    <span style={{
                                                        fontSize: '10px',
                                                        color: theme.textSecondary,
                                                        textAlign: 'center',
                                                        maxWidth: '90%',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {item.points || '?'}pts
                                                    </span>
                                                )}
                                                {item.isDirt && (
                                                    <span style={{ fontSize: '9px', color: '#8a6a4a' }}>???</span>
                                                )}
                                                {/* Rarity indicator for legendaries */}
                                                {rarity === 'legendary' && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-4px',
                                                        right: '-4px',
                                                        fontSize: '12px',
                                                        animation: 'pulse 1.5s infinite'
                                                    }}>⭐</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {excavatedItems.filter(item => !selectedForBasket.includes(item.id)).length === 0 && (
                                        <div style={{
                                            gridColumn: '1 / -1',
                                            textAlign: 'center',
                                            padding: '40px',
                                            color: theme.textMuted
                                        }}>
                                            All items packed! ✓
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT PANEL: Basket (40%) */}
                            <div style={{
                                flex: '1',
                                display: 'flex',
                                flexDirection: 'column',
                                background: `linear-gradient(180deg, ${theme.bgPanel} 0%, ${theme.bgDark} 100%)`,
                                border: `3px solid ${selectedForBasket.length >= BASKET_CAPACITY ? theme.error : theme.gold}`,
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: selectedForBasket.length >= BASKET_CAPACITY
                                    ? `0 0 20px rgba(239,68,68,0.3)`
                                    : `0 0 20px ${theme.goldGlow}`,
                                transition: 'border-color 0.3s, box-shadow 0.3s'
                            }}>
                                {/* Basket Header */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    background: selectedForBasket.length >= BASKET_CAPACITY
                                        ? `linear-gradient(90deg, ${theme.error}40 0%, ${theme.error}20 100%)`
                                        : `linear-gradient(90deg, ${theme.gold}40 0%, ${theme.gold}20 100%)`,
                                    borderBottom: `2px solid ${selectedForBasket.length >= BASKET_CAPACITY ? theme.error : theme.gold}40`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '20px' }}>🧺</span>
                                        <span style={{ color: theme.text, fontWeight: 'bold', fontSize: '14px' }}>
                                            Your Basket
                                        </span>
                                    </div>
                                    <span style={{
                                        background: selectedForBasket.length >= BASKET_CAPACITY ? theme.error : theme.bgDark,
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: selectedForBasket.length >= BASKET_CAPACITY ? '#fff' : theme.gold
                                    }}>
                                        {selectedForBasket.length}/{BASKET_CAPACITY}
                                    </span>
                                </div>

                                {/* Basket Slots Grid */}
                                <div style={{
                                    flex: 1,
                                    padding: '16px',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gridTemplateRows: 'repeat(2, 1fr)',
                                    gap: '10px'
                                }}>
                                    {Array.from({ length: BASKET_CAPACITY }).map((_, idx) => {
                                        const item = excavatedItems.find(i => i.id === selectedForBasket[idx]);
                                        const isEmpty = !item;

                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => item && toggleItemSelection(item.id)}
                                                style={{
                                                    background: isEmpty
                                                        ? `linear-gradient(135deg, ${theme.bgDark} 0%, ${theme.bgFrameInner} 100%)`
                                                        : item.isDirt
                                                            ? 'radial-gradient(circle, #6a4a2a 30%, #4a3020 100%)'
                                                            : `radial-gradient(circle, ${theme.bgFrameInner} 30%, ${theme.bgDark} 100%)`,
                                                    border: isEmpty
                                                        ? `2px dashed ${theme.border}`
                                                        : `3px solid ${theme.gold}`,
                                                    borderRadius: '10px',
                                                    cursor: item ? 'pointer' : 'default',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '4px',
                                                    transition: 'all 0.15s',
                                                    boxShadow: item ? `0 0 10px ${theme.goldGlow}` : 'inset 0 2px 8px rgba(0,0,0,0.3)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (item) {
                                                        e.currentTarget.style.transform = 'scale(1.05)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                                title={item ? 'Click to remove from basket' : `Slot ${idx + 1} - empty`}
                                            >
                                                {item ? (
                                                    <>
                                                        <span style={{ fontSize: '28px', filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.4))' }}>
                                                            {item.displayEmoji}
                                                        </span>
                                                        <span style={{ fontSize: '9px', color: theme.textMuted }}>
                                                            {item.isDirt ? '???' : `${item.points || '?'}pts`}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span style={{ fontSize: '24px', opacity: 0.2 }}>+</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Action Buttons */}
                                <div style={{
                                    padding: '12px 16px',
                                    borderTop: `1px solid ${theme.border}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}>
                                    {/* Clear Basket */}
                                    {selectedForBasket.length > 0 && (
                                        <button
                                            onClick={() => {
                                                setSelectedForBasket([]);
                                                addEventLog('Cleared basket');
                                            }}
                                            style={{
                                                padding: '8px',
                                                fontSize: '12px',
                                                background: 'transparent',
                                                color: theme.textMuted,
                                                border: `1px solid ${theme.border}`,
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            🗑️ Clear Basket
                                        </button>
                                    )}

                                    {/* CONFIRM - Reveal Button */}
                                    <button
                                        onClick={startRevealPhase}
                                        disabled={selectedForBasket.length === 0}
                                        style={{
                                            padding: '14px 24px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            background: selectedForBasket.length > 0
                                                ? `linear-gradient(135deg, ${theme.gold} 0%, ${theme.accent} 100%)`
                                                : '#444',
                                            color: selectedForBasket.length > 0 ? theme.bgDark : theme.textMuted,
                                            border: selectedForBasket.length > 0 ? `2px solid ${theme.gold}` : '2px solid #555',
                                            borderRadius: '10px',
                                            cursor: selectedForBasket.length > 0 ? 'pointer' : 'not-allowed',
                                            boxShadow: selectedForBasket.length > 0 ? `0 4px 20px ${theme.goldGlow}` : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        ✨ Reveal What's Inside!
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bottom hint strip */}
                        <div style={{
                            textAlign: 'center',
                            fontSize: '11px',
                            color: theme.textMuted,
                            padding: '8px'
                        }}>
                            💡 Click items to move between table and basket • Dirt clumps hide their true value until revealed
                        </div>
                    </div>
                )}

                {/* REVEAL PHASE - Show revealed items */}
                {(gamePhase === 'reveal' || gamePhase === 'score') && revealedItems.length > 0 && (
                    <div style={{
                        marginBottom: '15px',
                        padding: '20px',
                        background: 'linear-gradient(135deg, #2a2820 0%, #3a3525 100%)',
                        borderRadius: '12px',
                        border: `2px solid ${theme.gold}`
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '18px', color: theme.gold }}>
                            ✨ Your Finds ✨
                        </div>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px',
                            justifyContent: 'center'
                        }}>
                            {(combinedItems.length > 0 ? combinedItems : revealedItems).map((item, idx) => (
                                <div
                                    key={item.id || idx}
                                    style={{
                                        padding: '12px 18px',
                                        background: item.isCombo ? `${theme.gold}22` : item.type === 'treasure' ? `${theme.treasure}22` : '#1a1815',
                                        border: `2px solid ${item.isCombo ? theme.gold : item.type === 'treasure' ? theme.treasure : theme.border}`,
                                        borderRadius: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '6px',
                                        animation: item.justRevealed ? 'popIn 0.4s ease-out' : (item.isCombo ? 'glow 1s ease-in-out infinite alternate' : 'none')
                                    }}
                                >
                                    <span style={{ fontSize: '36px' }}>{item.emoji || item.displayEmoji}</span>
                                    <span style={{
                                        fontSize: '12px',
                                        color: item.isCombo ? theme.gold : theme.text,
                                        fontWeight: item.isCombo ? 'bold' : 'normal',
                                        textAlign: 'center'
                                    }}>
                                        {item.name || item.displayName}
                                    </span>
                                    <span style={{
                                        fontSize: '14px',
                                        color: theme.success,
                                        fontWeight: 'bold'
                                    }}>
                                        +{item.points || 0}
                                    </span>
                                    {item.isCombo && (
                                        <span style={{ fontSize: '10px', color: theme.textMuted }}>
                                            {item.from?.[0]?.emoji} + {item.from?.[1]?.emoji}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                        {combinedItems.length > 0 && (
                            <div style={{
                                textAlign: 'center',
                                marginTop: '15px',
                                fontSize: '20px',
                                color: theme.gold,
                                fontWeight: 'bold'
                            }}>
                                Total: {combinedItems.reduce((sum, item) => sum + (item.points || 0), 0)} points!
                            </div>
                        )}
                    </div>
                )}

                {/* BIG TREASURE BASKET - On the right side with physics! */}
                <div style={{
                    position: 'fixed',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '120px',
                    height: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 50,
                    pointerEvents: 'none'
                }}>
                    {/* Falling and landed items - all visible with physics! */}
                    {fallingItems.map(item => (
                        <div
                            key={item.id}
                            style={{
                                position: 'absolute',
                                left: `${item.x}%`,
                                top: item.y,
                                fontSize: item.landed ? '22px' : '28px',
                                transform: `rotate(${item.rotation}deg)`,
                                zIndex: item.landed ? 58 : 60, // Landed items behind falling ones
                                filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.5))',
                                transition: item.landed ? 'font-size 0.2s' : 'none'
                            }}
                        >
                            {item.emoji}
                        </div>
                    ))}

                    {/* The Basket */}
                    <div style={{
                        position: 'absolute',
                        bottom: truckDriving ? 80 : 20,
                        width: '100px',
                        height: '120px',
                        transition: truckDriving ? 'bottom 0.3s ease-out' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        {/* Lid - appears when full */}
                        {basketFull && (
                            <div style={{
                                fontSize: '60px',
                                marginBottom: '-25px',
                                animation: 'lidClose 0.4s ease-out forwards',
                                zIndex: 62
                            }}>
                                🪵
                            </div>
                        )}

                        {/* Basket body - z-index 56 so items (58-60) appear on top */}
                        <div style={{
                            fontSize: '80px',
                            position: 'relative',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                            zIndex: 56
                        }}>
                            🧺
                        </div>

                        {/* Item count - shows landed items */}
                        {fallingItems.filter(i => i.landed).length > 0 && !basketFull && (
                            <div style={{
                                marginTop: '-10px',
                                background: theme.gold,
                                color: '#1a1815',
                                padding: '2px 10px',
                                borderRadius: '10px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                            }}>
                                {fallingItems.filter(i => i.landed).length}/{BASKET_CAPACITY}
                            </div>
                        )}
                    </div>

                    {/* Truck - drives in when basket is full */}
                    {truckDriving && (
                        <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: truckPosition,
                            fontSize: '50px',
                            transform: 'scaleX(-1)', // Flip truck to face left!
                            transition: 'none',
                            zIndex: 55,
                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                        }}>
                            🚚
                        </div>
                    )}
                </div>

                {/* OLD GAME GRID - REMOVED (now in OrnateFrame above) */}
                {false && (gamePhase === 'prospect' || gamePhase === 'dig') && (
                <div style={{
                    flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
                    position: 'relative'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridSize}, ${tileSize}px)`,
                        gap: '3px',
                        background: theme.bgDark,
                        padding: '12px',
                        borderRadius: '12px',
                        position: 'relative',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}>
                        {grid.map((row, y) =>
                            row.map((tile, x) => {
                                const isDug = tile.dug;
                                const isFrozen = frozenTiles.some(f => f.x === x && f.y === y) && !isDug;
                                const isFlagged = tile.flagged;
                                const isRevealed = tile.revealed || revealedTiles.some(r => r.x === x && r.y === y);
                                const sonarTile = sonarTiles.find(s => s.x === x && s.y === y);
                                const isHinted = showHint && hintTile?.x === x && hintTile?.y === y;

                                // PHASE SYSTEM: Check scan status and marks
                                const tileKey = `${x}_${y}`;
                                const scanResult = signalStrengths[tileKey];
                                const isMarked = markedTiles.some(m => m.x === x && m.y === y);
                                const isScanned = scanResult !== undefined;

                                // Fog visibility
                                const fogVisible = !hasFog || isDug || isRevealed;
                                const fogOpacity = hasFog && !isDug && !isRevealed ? 0.15 : 1;

                                // Deep dig indicator
                                const isDeepPartial = tile.dugDepth > 0 && tile.dugDepth < tile.requiredDepth;

                                // Special tile indicator
                                const isSpecialTile = tile.specialType && !isDug;
                                const isIlluminated = illuminatedTiles.some(t => t.x === x && t.y === y);

                                // Get world-themed colors
                                const wTheme = currentTheme || worldThemes[0];
                                const baseTileColor = wTheme.tileBase;
                                const dugTileColor = wTheme.tileDug;

                                // Tile colors - use world theme
                                let bgColor = isLateLevel ? `${baseTileColor}` : baseTileColor;
                                let borderColor = wTheme.tileAccent;
                                let content = null;
                                let specialIndicator = null;

                                // Add special tile indicator - make it very visible
                                if (isSpecialTile) {
                                    bgColor = wTheme.tileSpecial;
                                    borderColor = wTheme.specialBorder;
                                    // Large centered emoji for special tiles
                                    specialIndicator = (
                                        <span style={{
                                            fontSize: tileSize * 0.5,
                                            opacity: 1,
                                            textShadow: `0 0 8px ${wTheme.specialBorder}, 0 0 4px white`,
                                            animation: 'pulse 2s infinite'
                                        }}>
                                            {wTheme.specialEmoji}
                                        </span>
                                    );
                                }

                                // Check for collectible at this position (undug only)
                                const collectibleHere = !isDug && collectiblePositions.find(c => c.x === x && c.y === y && !c.collected);
                                const collectibleInfo = collectibleHere ? collectibleTypes[collectibleHere.type] : null;

                                if (isDug) {
                                    bgColor = tile.distanceInfo?.color || dugTileColor;
                                    borderColor = tile.distanceInfo?.color || wTheme.tileAccent;
                                    // Show EMOJI instead of boring numbers!
                                    content = (
                                        <span style={{
                                            fontSize: tileSize * 0.55,
                                            textShadow: '1px 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)'
                                        }}>
                                            {tile.distanceInfo?.emoji || '❓'}
                                        </span>
                                    );
                                    specialIndicator = null; // Clear indicator when dug
                                } else if (isDeepPartial) {
                                    bgColor = dugTileColor;
                                    content = <span style={{ fontSize: tileSize * 0.4 }}>🕳️</span>;
                                } else if (isFlagged) {
                                    bgColor = wTheme.tileAccent;
                                    borderColor = theme.success;
                                    content = <span style={{ fontSize: tileSize * 0.5 }}>🚩</span>;
                                } else if (isFrozen) {
                                    bgColor = '#aaddff';
                                    borderColor = '#88bbdd';
                                    content = <span style={{ fontSize: tileSize * 0.4 }}>❄️</span>;
                                } else if (tile.revealed && tile.distanceInfo) {
                                    // X-ray revealed
                                    bgColor = `${tile.distanceInfo.color}44`;
                                    borderColor = tile.distanceInfo.color;
                                    content = (
                                        <span style={{
                                            fontSize: tileSize * 0.35,
                                            opacity: 0.7
                                        }}>
                                            ~{tile.distance?.toFixed(1)}
                                        </span>
                                    );
                                }

                                // REMOVED: Collectible sparkles - no more hints! Everything is hidden.

                                // Illuminated tiles (from spotlight) get a glow
                                if (isIlluminated && !isDug) {
                                    borderColor = '#ffee88';
                                    bgColor = `${bgColor}`;
                                }

                                // Sonar overlay
                                if (sonarTile) {
                                    const sonarInfo = sonarTile.info || getDistanceInfo(sonarTile.distance, gridSize);
                                    borderColor = sonarInfo.color;
                                }

                                // Hint highlight
                                if (isHinted) {
                                    borderColor = theme.gold;
                                    bgColor = `${theme.gold}44`;
                                }

                                // === PHASE SYSTEM VISUALS ===
                                let phaseOverlay = null;

                                // PROSPECT PHASE: Show scan results
                                if (gamePhase === 'prospect' && isScanned && !isDug) {
                                    const strength = scanResult.strength;
                                    const signalColor = strength >= 2.5 ? '#ff4444' : strength >= 1.5 ? '#ffaa00' : strength >= 0.5 ? '#44aa44' : '#666666';
                                    bgColor = `${signalColor}44`;
                                    borderColor = signalColor;
                                    content = (
                                        <span style={{
                                            fontSize: tileSize * 0.4,
                                            textShadow: `0 0 5px ${signalColor}`
                                        }}>
                                            {strength >= 2.5 ? '📡' : strength >= 1.5 ? '📶' : strength >= 0.5 ? '〰️' : '·'}
                                        </span>
                                    );
                                }

                                // Show marked tiles (for digging)
                                if (isMarked && !isDug) {
                                    borderColor = '#ffff00';
                                    phaseOverlay = (
                                        <div style={{
                                            position: 'absolute',
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            border: '3px solid #ffff00',
                                            borderRadius: '6px',
                                            boxShadow: '0 0 10px #ffff00, inset 0 0 10px rgba(255,255,0,0.3)',
                                            pointerEvents: 'none',
                                            zIndex: 5
                                        }}>
                                            <span style={{
                                                position: 'absolute',
                                                top: -8, right: -8,
                                                fontSize: '16px',
                                                background: '#222',
                                                borderRadius: '50%',
                                                padding: '2px'
                                            }}>⛏️</span>
                                        </div>
                                    );
                                }

                                // DIG PHASE: Show what was found at dug tiles
                                if (gamePhase === 'dig' && isDug) {
                                    const hiddenItem = hiddenContents[tileKey];
                                    if (hiddenItem) {
                                        bgColor = hiddenItem.isDirt ? '#8B4513' : '#3a5a3a';
                                        content = (
                                            <span style={{ fontSize: tileSize * 0.5 }}>
                                                {hiddenItem.isDirt ? '🟤' : hiddenItem.emoji}
                                            </span>
                                        );
                                    } else {
                                        bgColor = dugTileColor;
                                        content = <span style={{ fontSize: tileSize * 0.3, opacity: 0.5 }}>∅</span>;
                                    }
                                }

                                return (
                                    <div
                                        key={`${x}-${y}`}
                                        onClick={() => handleDig(x, y)}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            if (gamePhase === 'prospect') {
                                                handleMark(x, y);
                                            } else {
                                                handleFlag(x, y);
                                            }
                                        }}
                                        style={{
                                            width: tileSize,
                                            height: tileSize,
                                            background: bgColor,
                                            border: `2px solid ${borderColor}`,
                                            borderRadius: '6px',
                                            cursor: isDug && !isDeepPartial ? 'default' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.15s',
                                            opacity: fogOpacity,
                                            boxShadow: sonarTile
                                                ? `0 0 ${sonarFading ? '4px' : '12px'} ${sonarTile.info?.color || theme.accent}`
                                                : isHinted
                                                    ? `0 0 15px ${theme.gold}`
                                                    : isDug
                                                        ? `inset 0 2px 4px rgba(0,0,0,0.3)`
                                                        : '0 2px 4px rgba(0,0,0,0.2)',
                                            // Smooth transition for radar fade
                                            ...(sonarTile && sonarFading ? { opacity: 0.3, transition: 'all 1.5s ease-out' } : {}),
                                            position: 'relative'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isDug || isDeepPartial) {
                                                e.currentTarget.style.transform = 'scale(1.08)';
                                                e.currentTarget.style.zIndex = '10';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.zIndex = '1';
                                        }}
                                    >
                                        {content}

                                        {/* Special tile indicator */}
                                        {specialIndicator}

                                        {/* Phase overlay (marked tiles, etc) */}
                                        {phaseOverlay}

                                        {/* Sonar distance preview */}
                                        {sonarTile && !isDug && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '2px',
                                                fontSize: '10px',
                                                color: theme.text,
                                                textShadow: '1px 1px 2px black'
                                            }}>
                                                {sonarTile.distance?.toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}

                        {/* Hit effects */}
                        {hitEffects.map(e => {
                            const effectX = e.x * (tileSize + 3) + tileSize / 2;
                            const effectY = e.y * (tileSize + 3) + tileSize / 2;
                            return (
                                <div
                                    key={e.id}
                                    style={{
                                        position: 'absolute',
                                        left: effectX + 12,
                                        top: effectY + 12,
                                        transform: 'translate(-50%, -50%)',
                                        fontSize: e.type === 'treasure' ? '20px'
                                            : e.type === 'combo' ? '18px'
                                            : e.type === 'friend' ? '18px'
                                            : e.type === 'collectible' ? '16px'
                                            : '14px',
                                        fontWeight: 'bold',
                                        color: e.type === 'treasure' ? theme.gold
                                            : e.type === 'decoy' ? theme.error
                                            : e.type === 'gem' ? theme.gem
                                            : e.type === 'combo' ? theme.hot
                                            : e.type === 'error' ? theme.error
                                            : e.type === 'friend' ? '#50c878'
                                            : e.type === 'collectible' ? '#f4c542'
                                            : theme.text,
                                        pointerEvents: 'none',
                                        animation: 'floatUp 1.2s ease-out forwards',
                                        zIndex: 100,
                                        textShadow: '0 0 8px black, 0 0 4px black',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {e.text}
                                </div>
                            );
                        })}
                    </div>
                </div>
                )}

                {/* Collapsible Legend - JRPG style */}
                {(gamePhase === 'prospect' || gamePhase === 'dig') && (
                    <div style={{ marginTop: '12px' }}>
                        <ContextLegend
                            phase={gamePhase}
                            expanded={legendExpanded}
                            onToggle={() => setLegendExpanded(!legendExpanded)}
                            scanTheme={worldScanThemes[selectedOpponent?.id || 0]}
                        />
                    </div>
                )}

                {/* CSS Animations - JRPG Enhanced */}
                <style>{`
                    /* Fade in for new elements */
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-5px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    /* Scan ripple effect */
                    @keyframes scanRipple {
                        0% { transform: scale(0); opacity: 0.8; }
                        100% { transform: scale(2); opacity: 0; }
                    }
                    /* Stamp effect for marking */
                    @keyframes stampLand {
                        0% { transform: scale(1.5) rotate(-10deg); opacity: 0; }
                        50% { transform: scale(0.9) rotate(2deg); opacity: 1; }
                        100% { transform: scale(1) rotate(0deg); opacity: 1; }
                    }
                    /* Dig effect */
                    @keyframes digImpact {
                        0% { transform: scale(1); }
                        25% { transform: scale(0.95) translateY(2px); }
                        50% { transform: scale(1.02) translateY(-1px); }
                        100% { transform: scale(1) translateY(0); }
                    }
                    /* Shimmer for rare items */
                    @keyframes shimmer {
                        0% { background-position: -100% 0; }
                        100% { background-position: 200% 0; }
                    }
                    @keyframes floatUp {
                        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                        15% { transform: translate(-50%, -60%) scale(1.2); opacity: 1; }
                        100% { transform: translate(-50%, -150%) scale(1); opacity: 0; }
                    }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); opacity: 0.9; }
                        50% { transform: scale(1.15); opacity: 1; }
                    }
                    @keyframes pop {
                        0% { transform: scale(0); }
                        50% { transform: scale(1.3); }
                        100% { transform: scale(1); }
                    }
                    @keyframes popIn {
                        0% { transform: scale(0) rotate(-20deg); opacity: 0; }
                        60% { transform: scale(1.2) rotate(5deg); opacity: 1; }
                        100% { transform: scale(1) rotate(0deg); opacity: 1; }
                    }
                    @keyframes glow {
                        0% { box-shadow: 0 0 5px #f4c542, 0 0 10px #f4c542; }
                        100% { box-shadow: 0 0 15px #f4c542, 0 0 25px #f4c542; }
                    }
                    @keyframes dirtCrumble {
                        0% { transform: scale(1); filter: blur(0); }
                        50% { transform: scale(1.1); filter: blur(2px); }
                        100% { transform: scale(0); filter: blur(5px); opacity: 0; }
                    }
                    @keyframes lidClose {
                        0% { transform: translateY(-30px) rotate(-20deg); opacity: 0; }
                        60% { transform: translateY(5px) rotate(5deg); opacity: 1; }
                        100% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    }
                    @keyframes settleInBasket {
                        0% { transform: translateY(-10px) scale(1.5); }
                        50% { transform: translateY(3px) scale(0.9); }
                        100% { transform: translateY(0) scale(1); }
                    }
                    @keyframes float-0 {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        25% { transform: translate(10px, -20px) rotate(5deg); }
                        50% { transform: translate(-5px, -35px) rotate(-3deg); }
                        75% { transform: translate(8px, -15px) rotate(3deg); }
                    }
                    @keyframes float-1 {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(-15px, -25px) rotate(-5deg); }
                        66% { transform: translate(10px, -40px) rotate(5deg); }
                    }
                    @keyframes float-2 {
                        0%, 100% { transform: translate(0, 0); }
                        50% { transform: translate(5px, -30px); }
                    }
                `}</style>
            </div>
        );
    }

    // RESULT SCREEN
    if (gameState === 'result') {
        const won = treasurePositions.length === 0;
        const config = levelConfig;

        const digBonus = won ? digsRemaining * 10 : 0;
        const comboBonus = maxCombo * 15;
        const noDecoyBonus = won && decoysHit === 0 ? 50 : 0;
        const underParBonus = won && config && digsRemaining >= config.parDigs ? 75 : 0;
        const finalScore = score + digBonus + comboBonus + noDecoyBonus + underParBonus;

        // New star system: 0.5 for completion + 0.5 for bonus objective
        const completionStar = won ? 0.5 : 0;
        const bonusStar = won && bonusAchieved ? 0.5 : 0;
        const starsEarned = completionStar + bonusStar;
        const isFullStar = starsEarned === 1;

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${won ? theme.success : theme.error}18 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: theme.text, padding: '20px'
            }}>
                <div style={{
                    fontSize: '120px', marginBottom: '20px',
                    animation: won ? 'bounce 1s infinite' : 'shake 0.5s'
                }}>
                    {won ? (isFullStar ? '👑' : '💎') : '💀'}
                </div>

                <h1 style={{
                    fontSize: '42px',
                    color: won ? (isFullStar ? theme.gold : theme.success) : theme.error,
                    marginBottom: '10px',
                    textShadow: won ? `0 0 30px ${theme.goldGlow}` : 'none'
                }}>
                    {won
                        ? (isFullStar ? 'PERFECT LEVEL!' : 'TREASURE FOUND!')
                        : 'OUT OF DIGS!'}
                </h1>

                {won && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        {/* Star display with half-star support */}
                        <div style={{
                            width: '50px', height: '50px',
                            borderRadius: '50%',
                            border: `3px solid ${theme.gold}`,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: starsEarned > 0 ? `0 0 15px ${theme.goldGlow}` : 'none'
                        }}>
                            <div style={{
                                position: 'absolute',
                                left: 0, top: 0, bottom: 0,
                                width: `${starsEarned * 100}%`,
                                background: theme.gold
                            }} />
                        </div>
                        <span style={{ fontSize: '28px', color: theme.gold, fontWeight: 'bold' }}>
                            {starsEarned === 1 ? '★' : starsEarned === 0.5 ? '½★' : '☆'}
                        </span>
                    </div>
                )}

                <div style={{
                    fontSize: '48px', marginBottom: '15px', color: theme.gold,
                    textShadow: `0 0 20px ${theme.goldGlow}`
                }}>
                    {finalScore} pts
                </div>

                <div style={{
                    background: theme.bgPanel,
                    padding: '20px 30px',
                    borderRadius: '15px',
                    marginBottom: '25px',
                    minWidth: '300px'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '10px 20px',
                        fontSize: '14px'
                    }}>
                        <span style={{ color: theme.textMuted }}>Base Score:</span>
                        <span style={{ color: theme.text, textAlign: 'right' }}>{score}</span>

                        <span style={{ color: theme.textMuted }}>Treasures Found:</span>
                        <span style={{ color: theme.success, textAlign: 'right' }}>{treasuresFound}</span>

                        <span style={{ color: theme.textMuted }}>Max Combo:</span>
                        <span style={{ color: theme.warm, textAlign: 'right' }}>{maxCombo}x</span>

                        {collectedItems.length > 0 && (
                            <>
                                <span style={{ color: theme.textMuted }}>Items Found:</span>
                                <span style={{ color: '#f4c542', textAlign: 'right' }}>
                                    {collectedItems.length} 🧺
                                </span>
                            </>
                        )}

                        {friendsFound > 0 && (
                            <>
                                <span style={{ color: theme.textMuted }}>Friends Made:</span>
                                <span style={{ color: '#50c878', textAlign: 'right' }}>
                                    {friendsFound} 🐾
                                </span>
                            </>
                        )}

                        {won && (
                            <>
                                <span style={{ color: theme.textMuted }}>Digs Remaining:</span>
                                <span style={{ color: theme.accent, textAlign: 'right' }}>
                                    {digsRemaining} (+{digBonus})
                                </span>

                                {comboBonus > 0 && (
                                    <>
                                        <span style={{ color: theme.textMuted }}>Combo Bonus:</span>
                                        <span style={{ color: theme.warm, textAlign: 'right' }}>+{comboBonus}</span>
                                    </>
                                )}

                                {noDecoyBonus > 0 && (
                                    <>
                                        <span style={{ color: theme.textMuted }}>No Decoys Hit:</span>
                                        <span style={{ color: theme.success, textAlign: 'right' }}>+{noDecoyBonus}</span>
                                    </>
                                )}

                                {underParBonus > 0 && (
                                    <>
                                        <span style={{ color: theme.textMuted }}>Under Par Bonus:</span>
                                        <span style={{ color: theme.gold, textAlign: 'right' }}>+{underParBonus}</span>
                                    </>
                                )}
                            </>
                        )}

                        {decoysHit > 0 && (
                            <>
                                <span style={{ color: theme.error }}>Decoys Hit:</span>
                                <span style={{ color: theme.error, textAlign: 'right' }}>{decoysHit}</span>
                            </>
                        )}
                    </div>
                </div>

                {won && (
                    <div style={{
                        background: theme.bgPanel,
                        padding: '15px 25px',
                        borderRadius: '10px',
                        marginBottom: '25px',
                        border: `2px solid ${isFullStar ? theme.gold : theme.success}`
                    }}>
                        <div style={{ marginBottom: '10px' }}>
                            <span style={{ color: theme.success, fontWeight: 'bold' }}>
                                ✓ Level Complete: +½★
                            </span>
                        </div>
                        {config?.bonusObjective && (
                            <div style={{ marginBottom: '10px' }}>
                                <span style={{
                                    color: bonusAchieved ? theme.gold : theme.textMuted,
                                    fontWeight: bonusAchieved ? 'bold' : 'normal'
                                }}>
                                    {bonusAchieved ? '✓' : '○'} Bonus: {config.bonusObjective.desc}
                                    {bonusAchieved ? ' +½★' : ''}
                                </span>
                            </div>
                        )}
                        <div style={{
                            borderTop: `1px solid ${theme.border}`,
                            paddingTop: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ color: theme.gold, fontWeight: 'bold', fontSize: '18px' }}>
                                    +{starsEarned}★ earned!
                                </div>
                                <div style={{ color: theme.textMuted, fontSize: '11px' }}>
                                    (Level {currentLevel} of 10)
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: theme.textSecondary }}>
                                    World Progress: {getStars(selectedOpponent?.id || 0)}/10★
                                </div>
                                {getStars(selectedOpponent?.id || 0) >= 10 && selectedOpponent?.id < 9 && (
                                    <div style={{ color: theme.success, fontSize: '11px' }}>
                                        ✓ Next world unlocked!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        onClick={() => startMatch(selectedOpponent, currentLevel)}
                        style={{
                            padding: '15px 35px', fontSize: '18px',
                            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                            border: 'none', borderRadius: '12px', color: '#1a1815',
                            cursor: 'pointer', fontWeight: 'bold',
                            boxShadow: `0 4px 15px ${theme.goldGlow}`
                        }}
                    >
                        {won ? 'Play Again' : 'Try Again'}
                    </button>

                    {won && currentLevel < 10 && (
                        <button
                            onClick={() => startMatch(selectedOpponent, currentLevel + 1)}
                            style={{
                                padding: '15px 35px', fontSize: '18px',
                                background: `linear-gradient(135deg, ${theme.success}, ${theme.success}88)`,
                                border: 'none', borderRadius: '12px', color: 'white',
                                cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            Next Level →
                        </button>
                    )}

                    <button
                        onClick={() => setGameState('level_select')}
                        style={{
                            padding: '15px 35px', fontSize: '18px',
                            background: 'transparent',
                            border: `2px solid ${theme.border}`,
                            borderRadius: '12px', color: theme.textSecondary,
                            cursor: 'pointer'
                        }}
                    >
                        Level Select
                    </button>
                </div>

                <style>{`
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0) rotate(0deg); }
                        25% { transform: translateY(-15px) rotate(-5deg); }
                        75% { transform: translateY(-15px) rotate(5deg); }
                    }
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-10px); }
                        75% { transform: translateX(10px); }
                    }
                `}</style>
            </div>
        );
    }

    return null;
};

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TreasureDig />);
