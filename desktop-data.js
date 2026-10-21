'use strict';

window.PORTFOLIO_DATA = {
  projects: {
    tireless: {
      title: 'The Tireless Hand',
      kicker: 'AGENT EVALUATION / FLYTBASE HACKATHON',
      summary: 'An AI agent introduces bugs into a drone cockpit. A deterministic test harness tries to catch them.',
      role: 'Engineering and QA automation',
      stack: 'TypeScript / Playwright / Socket.IO',
      idea: 'A flight dashboard can look right while showing stale or incorrect data. I wanted to check the interface against what the drone was actually doing.',
      features: 'The mutation agent proposes realistic defects. Seven checks compare the cockpit with an independent telemetry feed, without LLM calls in the test loop. Answer keys stay sealed until each run is scored.',
      note: 'The recorded evaluation caught 11 of 13 injected bugs, with no false alarms across three clean or harmless builds. The report explains both misses. These results describe that test set.',
      url: 'https://github.com/Tanmay-Ts/Tireless',
      label: 'View source',
      secondary: 'https://github.com/Tanmay-Ts/Tireless/blob/main/qa/recordings/report-cloud.md',
      secondaryLabel: 'Read the evaluation'
    },
    driving: {
      title: 'Driving Seat',
      kicker: 'OPEN SOURCE / HUMAN + AGENT COLLABORATION',
      summary: 'A Claude Code skill that keeps the developer involved in decisions that matter.',
      role: 'Skill design and implementation',
      stack: 'Claude Code / Agent instructions / Scenario evaluation',
      idea: 'Coding agents make plenty of small decisions while building. I wanted a clear record of those choices, and a way to bring consequential ones back to the person responsible.',
      features: 'The skill turns intent into measurable goals, records routine decisions, and surfaces tradeoffs involving things like permissions, data loss and evaluation integrity. Specifications and decision logs make the work easier to review.',
      note: 'The repository includes four evaluation scenarios, each run with and without the skill. I wrote and graded the checks, with one run per scenario. This is a sanity check, not a broad benchmark.',
      url: 'https://github.com/Tanmay-Ts/driving-seat',
      label: 'View the skill',
      secondary: 'https://github.com/Tanmay-Ts/driving-seat#how-it-works',
      secondaryLabel: 'How it works'
    },
    vigil: {
      title: 'Vigil',
      kicker: 'AI PRODUCT / FOUNDER + BUILDER',
      summary: 'Brand-reputation monitoring across public signals and what AI models say about a business.',
      role: 'Founder and builder',
      stack: 'Web application / AI integrations / Reputation monitoring',
      idea: 'Founders need a way to see how their brand is being described, notice emerging problems, and decide what deserves attention.',
      features: 'Vigil brings together reputation signals and AI brand perception. It grew out of NeuroChain, which collects news, Google and YouTube mentions, groups incidents, and pairs rule-based risk scores with AI summaries and email alerts.',
      note: 'Vigil is a private-code product. NeuroChain is the public earlier prototype; its README records a top-five finish among 5,000 teams at Mumbai Hacks 2025.',
      url: 'https://getvigil.in/',
      label: 'Visit Vigil',
      secondary: 'https://github.com/Tanmay-Ts/neurochain',
      secondaryLabel: 'View the earlier prototype'
    },
    reels: {
      title: 'Reel-MMA',
      kicker: 'VIDEO AUTOMATION / PAUSED EXPERIMENT',
      summary: 'A pipeline that turns raw MMA training footage into vertical highlight reels for review.',
      role: 'Pipeline engineering',
      stack: 'Python / GPT-4o / ffmpeg / Cloudflare R2',
      idea: 'I built this for Ignition MMA to find useful highlights in long training sessions and cut down the manual editing work.',
      features: 'Local motion and audio heuristics find candidate moments. GPT-4o scores the action, an editing agent plans the sequence, and ffmpeg renders 9:16 reels. GitHub Actions runs the pipeline, with media in Cloudflare R2 and a person reviewing the output.',
      note: 'The experiment is paused because vision API costs per reel were too high. It produces reviewable files and does not publish videos automatically.',
      url: 'https://github.com/Tanmay-Ts/Reel-MMA',
      label: 'View source',
      secondary: 'https://github.com/Tanmay-Ts/Reel-MMA#how-it-works',
      secondaryLabel: 'Explore the pipeline'
    }
  },
  contributions: [
    {
      repo: 'liliu-z/stashbase',
      number: 225,
      title: 'Clearer scheduled-task results',
      description: 'Added reply excerpts, missed-day history and clearer run states, with Windows reliability fixes.',
      status: 'merged',
      url: 'https://github.com/liliu-z/stashbase/pull/225'
    },
    {
      repo: 'existence-master/Sentient',
      number: 476,
      title: 'Memories that use your name',
      description: 'Made saved memories use the configured person\'s name while preserving references to other users.',
      status: 'merged',
      url: 'https://github.com/existence-master/Sentient/pull/476'
    },
    {
      repo: 'existence-master/Sentient',
      number: 486,
      title: 'Reliable tool-call details',
      description: 'Matched activity details by tool-call ID so calls sharing a timestamp keep the right arguments.',
      status: 'merged',
      url: 'https://github.com/existence-master/Sentient/pull/486'
    },
    {
      repo: 'aws-powertools/powertools-lambda-python',
      number: 8617,
      title: 'Consistent parameter errors',
      description: 'Proposed consistent handling of SSM request failures, preserving successful values in graceful mode.',
      status: 'open',
      url: 'https://github.com/aws-powertools/powertools-lambda-python/pull/8617'
    },
    {
      repo: 'BerriAI/litellm',
      number: 47843,
      title: 'Accurate rerank cost tracking',
      description: 'Proposed preserving provider-reported rerank costs instead of logging paid calls as free. Live-provider verification is pending.',
      status: 'draft',
      url: 'https://github.com/BerriAI/litellm/pull/47843'
    }
  ]
};
