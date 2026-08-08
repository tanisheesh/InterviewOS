-- ─────────────────────────────────────────────────────────────
-- InterviewOS — Question bank seed
-- Run AFTER schema.sql in the Supabase SQL editor
-- ─────────────────────────────────────────────────────────────

-- ═══ SDE QUESTIONS ════════════════════════════════════════════

-- DSA
insert into public.questions (role, category, difficulty, prompt_text, expected_concepts) values
('sde', 'Data Structures & Algorithms', 'easy',
 'Given an array of integers, return the indices of the two numbers that add up to a specific target. You may assume exactly one solution exists, and you may not use the same element twice.',
 ARRAY['hash map', 'O(n) time complexity', 'brute force vs optimal', 'edge cases for empty/single element']),

('sde', 'Data Structures & Algorithms', 'medium',
 'Given a linked list, detect if it contains a cycle. If it does, return the node where the cycle begins. Explain your approach and its time/space complexity.',
 ARRAY['Floyd''s cycle detection', 'slow and fast pointers', 'finding cycle start', 'O(1) space approach']),

('sde', 'Data Structures & Algorithms', 'medium',
 'Implement a LRU (Least Recently Used) cache that supports O(1) get and put operations.',
 ARRAY['doubly linked list', 'hash map', 'O(1) operations', 'eviction policy', 'move-to-front on access']),

('sde', 'Data Structures & Algorithms', 'hard',
 'Given a list of intervals, merge all overlapping intervals and return the resulting list.',
 ARRAY['sorting by start', 'greedy approach', 'edge cases: one interval, all overlapping', 'O(n log n) complexity']),

('sde', 'Data Structures & Algorithms', 'medium',
 'Implement a stack that supports push, pop, top, and retrieving the minimum element in O(1) time.',
 ARRAY['auxiliary min-stack', 'O(1) getMin', 'handling duplicates', 'pop synchronization']),

-- System Design
('sde', 'System Design', 'medium',
 'Design a URL shortener like bit.ly. Cover the core components, data model, and how you''d handle scale.',
 ARRAY['hash generation', 'collision handling', 'read-heavy vs write-heavy', 'caching layer', 'database choice', 'analytics']),

('sde', 'System Design', 'hard',
 'Design a notification delivery system (email, push, SMS) that needs to handle 10 million notifications per day with reliable delivery guarantees.',
 ARRAY['message queues', 'retry mechanisms', 'idempotency', 'fan-out', 'rate limiting per channel', 'delivery receipts', 'dead-letter queues']),

('sde', 'System Design', 'hard',
 'Design a distributed rate limiter that can be used across multiple servers to throttle API calls per user.',
 ARRAY['token bucket vs sliding window', 'Redis for distributed state', 'Lua scripts for atomicity', 'edge cases on clock skew', 'fail-open vs fail-closed']),

('sde', 'System Design', 'medium',
 'Design a leaderboard system for an online game that shows the top 100 players globally and a user''s rank at any time.',
 ARRAY['Redis sorted sets', 'rank query optimization', 'score update frequency', 'approximate vs exact ranking', 'pagination']),

-- CS Fundamentals
('sde', 'CS Fundamentals', 'easy',
 'What is the difference between a process and a thread? When would you use one over the other?',
 ARRAY['memory isolation', 'context switch cost', 'shared memory in threads', 'GIL in Python', 'use cases for each']),

('sde', 'CS Fundamentals', 'medium',
 'Explain how a HashMap works internally. What happens during a collision, and how does resizing work?',
 ARRAY['hash function', 'separate chaining vs open addressing', 'load factor', 'rehashing cost', 'worst-case O(n) scenario']),

('sde', 'CS Fundamentals', 'medium',
 'Describe the differences between SQL and NoSQL databases. When would you choose each?',
 ARRAY['ACID vs BASE', 'schema flexibility', 'horizontal scaling', 'use cases (relational vs document vs key-value)', 'CAP theorem basics']),

-- OOP & Patterns
('sde', 'OOP & Patterns', 'easy',
 'Explain the SOLID principles. Give a brief example of how violating one of them leads to maintenance problems.',
 ARRAY['Single Responsibility', 'Open/Closed', 'Liskov', 'Interface Segregation', 'Dependency Inversion', 'real code example']),

('sde', 'OOP & Patterns', 'medium',
 'When would you use a Singleton pattern, and what are its downsides? How would you make it thread-safe?',
 ARRAY['global state problems', 'testability', 'double-checked locking', 'alternatives like dependency injection', 'module-level singletons in Python/JS']);

-- ═══ PM QUESTIONS ═════════════════════════════════════════════

insert into public.questions (role, category, difficulty, prompt_text, expected_concepts) values
('pm', 'Product Sense', 'easy',
 'How would you improve the onboarding experience for a productivity app like Notion? What metrics would you use to measure success?',
 ARRAY['user activation', 'time-to-value', 'aha moment', 'A/B testing', 'funnel analysis', 'cohort retention']),

('pm', 'Product Sense', 'medium',
 'You are the PM for Instagram Stories. A competitor has launched a similar feature with higher engagement. What would you do?',
 ARRAY['competitive analysis', 'user research', 'differentiation strategy', 'build vs copy tradeoffs', 'north star metric', 'stakeholder alignment']),

('pm', 'Product Sense', 'hard',
 'Design a product for helping senior citizens adopt digital payments in India. How would you identify the right problem to solve first?',
 ARRAY['user interviews', 'persona definition', 'pain point prioritization', 'trust barriers', 'feature sequencing', 'go-to-market']),

('pm', 'Prioritization', 'medium',
 'You have three feature requests: a power user workflow improvement (affects 5% of users), a bug that crashes the app for 2% of users, and a new onboarding flow. How do you prioritize them?',
 ARRAY['impact vs effort', 'RICE or ICE scoring', 'bug vs feature tradeoffs', 'user segment weighting', 'stakeholder buy-in', 'revenue impact']),

('pm', 'Prioritization', 'hard',
 'Your team has 6 weeks until the next major release. Engineering says the roadmap has 10 weeks of work. Walk me through how you cut scope without alienating stakeholders.',
 ARRAY['must-have vs nice-to-have', 'negotiation with engineering', 'communicating tradeoffs', 'MVP mindset', 'flagging risks', 'post-launch iteration plan']),

('pm', 'Metrics & Analytics', 'easy',
 'You notice daily active users dropped 15% this week. How do you diagnose the root cause?',
 ARRAY['segmentation (platform, region, cohort)', 'funnel drop-off', 'external factors (holiday, outage)', 'feature launch correlation', 'data validation first', 'hypothesis-driven approach']),

('pm', 'Metrics & Analytics', 'medium',
 'Define the north star metric for a B2B SaaS project management tool. Why that metric, and what are the leading indicators?',
 ARRAY['active teams / projects created', 'engagement depth', 'retention vs acquisition', 'leading vs lagging indicators', 'avoiding vanity metrics']),

('pm', 'Estimation', 'medium',
 'Estimate the number of Uber rides taken in Mumbai in a day. Walk me through your reasoning.',
 ARRAY['population-based approach', 'supply and demand estimation', 'fermi decomposition', 'sanity checking', 'showing reasoning clearly', 'stating assumptions']),

('pm', 'Estimation', 'hard',
 'Estimate the total cloud storage used by all Gmail users worldwide.',
 ARRAY['number of Gmail users', 'average emails per user/day', 'email size distribution', 'attachments', 'spam filtering', 'growth over years', 'order of magnitude check']);

-- ═══ DATA QUESTIONS ═══════════════════════════════════════════

insert into public.questions (role, category, difficulty, prompt_text, expected_concepts) values
('data', 'SQL & Databases', 'easy',
 'Write a SQL query to find the second-highest salary in an employees table. Handle the case where there is no second-highest salary.',
 ARRAY['LIMIT OFFSET', 'subquery', 'DENSE_RANK()', 'NULL handling', 'multiple approaches']),

('data', 'SQL & Databases', 'medium',
 'You have a transactions table with columns: user_id, transaction_date, amount. Write a query to find users who made purchases on at least 3 consecutive days.',
 ARRAY['self join or window functions', 'LAG/LEAD', 'date arithmetic', 'GROUP BY with HAVING', 'edge cases: same day multiple transactions']),

('data', 'SQL & Databases', 'hard',
 'You have a table of events (user_id, event_type, timestamp). Write a query to compute a 7-day rolling retention rate.',
 ARRAY['window functions', 'ROWS BETWEEN', 'cohort definition', 'date truncation', 'division by zero handling', 'performance considerations']),

('data', 'Statistics & Probability', 'easy',
 'Explain the difference between Type I and Type II errors in hypothesis testing. Which is worse, and does the answer depend on context?',
 ARRAY['false positive vs false negative', 'significance level alpha', 'statistical power', 'context dependency (medical vs product test)', 'tradeoff']),

('data', 'Statistics & Probability', 'medium',
 'Your A/B test shows the treatment group has a 3% higher conversion rate with a p-value of 0.04. Your manager wants to ship it immediately. What questions do you ask?',
 ARRAY['sample size and power', 'practical significance vs statistical significance', 'novelty effect', 'segment analysis', 'duration', 'multiple comparisons problem', 'business tradeoffs']),

('data', 'ML Concepts', 'easy',
 'Explain the bias-variance tradeoff. How does model complexity affect each, and how do you tune for the right balance?',
 ARRAY['underfitting vs overfitting', 'regularization', 'validation curves', 'cross-validation', 'learning curves', 'ensemble methods']),

('data', 'ML Concepts', 'medium',
 'Your classification model achieves 95% accuracy on a dataset where 95% of samples belong to class 0. Is it a good model? What metrics would you use instead?',
 ARRAY['class imbalance problem', 'precision and recall', 'F1 score', 'AUC-ROC', 'confusion matrix', 'resampling techniques', 'threshold tuning']),

('data', 'ML Concepts', 'hard',
 'Describe how you would build a recommendation system for an e-commerce platform from scratch. What approach would you start with and why?',
 ARRAY['collaborative vs content-based filtering', 'cold start problem', 'popularity baseline', 'matrix factorization', 'evaluation metrics (NDCG, hit rate)', 'online vs offline evaluation', 'feedback loop concerns']),

('data', 'Case Analysis', 'medium',
 'You are a data analyst at a food delivery app. Revenue dropped 20% last month. Walk me through how you''d investigate and what data you''d pull.',
 ARRAY['decompose revenue (orders x AOV)', 'segment by city/category/time', 'supply vs demand issue', 'coupon/discount impact', 'external events', 'funnel analysis', 'hypothesis prioritization']),

('data', 'Case Analysis', 'hard',
 'A new ML-based fraud detection model has better precision but lower recall than the previous rule-based system. The engineering team wants to ship it. What is your recommendation?',
 ARRAY['business cost of false negatives vs false positives', 'financial impact calculation', 'can you tune threshold?', 'ensemble approach', 'monitoring and rollback plan', 'stakeholder communication']);
