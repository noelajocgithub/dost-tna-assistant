<?php

// Canonical default AI Assist prompts. The `ai_prompts` table is seeded from
// this file; administrators may override any `instruction` at runtime, and a
// "reset" restores the value here. Keys are stable identifiers — the form field
// keys match the section field names sent by the frontend.
//
// Scopes:
//   system     — the scaffold that wraps every prompt. Placeholders:
//                {section}, {context}, {instruction}.
//   form       — applicant-facing form narrative fields (the "Task" instruction).
//   evaluation — evaluator / TNA-lead comment drafting. The section-comment
//                template may use the {section} placeholder.

return [

    'system' => [
        'label' => 'System scaffold (wraps every prompt)',
        'scope' => 'system',
        'instruction' => implode("\n", [
            'You are assisting an MSME with the DOST Technology Needs Assessment (TNA) Form 01.',
            'Section: {section}',
            '',
            'Use ONLY the context below. Write in clear, professional English suitable for a',
            'Philippine government technology assessment form. Return only the narrative text,',
            'with no preamble, headings, or markdown.',
            '',
            'Context:',
            '{context}',
            '',
            'Task: {instruction}',
        ]),
    ],

    // --- Form narrative fields (scope: form) ---
    'business_background' => ['label' => 'Business Background', 'scope' => 'form', 'instruction' => 'Write a concise 3-paragraph business background.'],
    'products_services' => ['label' => 'Products / Services Offered', 'scope' => 'form', 'instruction' => 'Describe the products and services offered in 1-2 paragraphs.'],
    'reason_for_assistance' => ['label' => 'Reason for Requesting Assistance', 'scope' => 'form', 'instruction' => 'Draft a clear statement of why the enterprise needs DOST assistance.'],
    'organizational_structure' => ['label' => 'Organizational Structure', 'scope' => 'form', 'instruction' => "Describe the enterprise's organizational structure, key roles, and reporting relationships."],
    'five_year_plan' => ['label' => '5-Year Plan', 'scope' => 'form', 'instruction' => 'Write a realistic 5-year business plan summary.'],
    'ten_year_plan' => ['label' => '10-Year Plan', 'scope' => 'form', 'instruction' => 'Write a realistic 10-year business plan summary.'],
    'vision_mission_values' => ['label' => 'Vision, Mission & Values', 'scope' => 'form', 'instruction' => 'Draft a vision statement, mission statement, and 3-5 core values.'],
    'production_problems' => ['label' => 'Production Problems and Concerns', 'scope' => 'form', 'instruction' => 'Summarize likely production problems based on the equipment and context.'],
    'waste_management' => ['label' => 'Production Waste Management System', 'scope' => 'form', 'instruction' => 'Describe a practical waste management approach.'],
    'production_plan' => ['label' => 'Production System', 'scope' => 'form', 'instruction' => "Describe the enterprise's production system."],
    'production_planning_control' => ['label' => 'Production Planning and Control', 'scope' => 'form', 'instruction' => "Describe the enterprise's production planning and control practices."],
    'work_study_improvement' => ['label' => 'Work Study/Improvement', 'scope' => 'form', 'instruction' => 'Describe work study and process improvement practices.'],
    'quality_assurance_system' => ['label' => 'Quality Assurance System', 'scope' => 'form', 'instruction' => 'Describe the quality assurance system in place.'],
    'product_process_performance' => ['label' => 'Product and Process Performance & Improvement', 'scope' => 'form', 'instruction' => 'Describe product and process performance monitoring and improvement.'],
    'gmp_haccp_details' => ['label' => 'GMP/HACCP Activities', 'scope' => 'form', 'instruction' => "Describe the enterprise's GMP/HACCP activities and food-safety practices."],
    'process_flow' => ['label' => 'Process Flow', 'scope' => 'form', 'instruction' => 'Describe the production process flow step by step.'],
    'inventory_system' => ['label' => 'Inventory System', 'scope' => 'form', 'instruction' => 'Describe an appropriate inventory system.'],
    'maintenance_program' => ['label' => 'Maintenance Program', 'scope' => 'form', 'instruction' => 'Describe an equipment maintenance program.'],
    'purchasing_system' => ['label' => 'Purchasing / Supplies System', 'scope' => 'form', 'instruction' => 'Describe a purchasing and supplies management system.'],
    'marketing_plan' => ['label' => 'Marketing Plan', 'scope' => 'form', 'instruction' => 'Write a concise marketing plan.'],
    'promotional_strategies' => ['label' => 'Promotional Strategies', 'scope' => 'form', 'instruction' => 'Suggest promotional strategies suited to this enterprise.'],
    'market_competitors' => ['label' => 'Market Competitors', 'scope' => 'form', 'instruction' => 'Summarize the likely competitive landscape.'],
    'cash_flow' => ['label' => 'Cash Flow / Financial Documents', 'scope' => 'form', 'instruction' => 'Summarize the cash flow / financial position narrative.'],
    'capital_sources' => ['label' => 'Source(s) of Capital / Credit', 'scope' => 'form', 'instruction' => "Describe the enterprise's sources of capital and credit."],
    'accounting_system' => ['label' => 'Accounting System', 'scope' => 'form', 'instruction' => 'Describe an appropriate accounting system.'],
    'hiring_criteria' => ['label' => 'Hiring Criteria', 'scope' => 'form', 'instruction' => 'Draft hiring criteria for key roles.'],
    'incentives' => ['label' => 'Incentives', 'scope' => 'form', 'instruction' => 'Suggest employee incentive practices.'],
    'training_development' => ['label' => 'Training and Development', 'scope' => 'form', 'instruction' => 'Describe training and development programs for employees.'],
    'safety_measures' => ['label' => 'Safety Measures Practiced', 'scope' => 'form', 'instruction' => 'Describe workplace safety measures.'],
    'employee_welfare' => ['label' => 'Other Employee Welfare', 'scope' => 'form', 'instruction' => 'Describe other employee welfare programs and benefits.'],
    'other_concerns' => ['label' => 'Other Concerns', 'scope' => 'form', 'instruction' => 'Summarize any other relevant concerns for this enterprise.'],

    // --- Evaluator comment drafting (scope: evaluation) ---
    'eval_section_comment' => [
        'label' => 'Evaluator — Section Comment',
        'scope' => 'evaluation',
        'instruction' => 'You are a DOST regional evaluator reviewing the "{section}" section of an MSME TNA Form 01. Based on the applicant\'s data, draft a concise, professional evaluator comment (2-4 sentences) noting strengths, gaps, or compliance concerns. Return only the comment text.',
    ],
    'eval_overall_comment' => [
        'label' => 'Evaluator — Overall Comment',
        'scope' => 'evaluation',
        'instruction' => 'You are a DOST regional evaluator. Draft a concise overall evaluation summary comment (3-5 sentences) for this TNA based on the section decisions and applicant data. Return only the comment text.',
    ],

];
