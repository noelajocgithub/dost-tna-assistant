<?php

// Canonical definition of the 8 data-bearing TNA form sections (Step 9 is
// "Review & Submit" and holds no data of its own). Shared by the API for
// validation and by export. Field lists mirror Blueprint §5.7.
return [
    'sections' => [
        'enterprise_info'     => 'Enterprise Information',
        'business_profile'    => 'Business Profile',
        'workforce'           => 'Workforce',
        'business_assessment' => 'Business Assessment',
        'production'          => 'Production & Supply Chain',
        'marketing'           => 'Marketing',
        'finance'             => 'Finance',
        'human_resources'     => 'Human Resources',
    ],

    // Roles. Supervisors: provincial_director oversees provincial_staff;
    // tna_lead oversees regional_evaluator.
    'roles' => [
        'enterprise',
        'provincial_staff',
        'provincial_director',
        'regional_evaluator',
        'tna_lead',
        'regional_director',
        'admin',
    ],

    // Organizational units. PSTO-* are provincial offices (under the
    // Provincial Director); INTERC is the regional unit (under the TNA Lead).
    'units' => [
        'PSTO-ADN',
        'PSTO-ADS',
        'PSTO-SDN',
        'PSTO-SDS',
        'PSTO-PDI',
        'INTERC',
    ],

    // Provinces of the Caraga Region (Region XIII). Used for the user
    // Province dropdown; a Provincial Director is scoped to one of these.
    'provinces' => [
        'Agusan del Norte',
        'Agusan del Sur',
        'Surigao del Norte',
        'Surigao del Sur',
        'Dinagat Islands',
    ],

    // Evaluator decision options (per-section and overall).
    'evaluation_actions' => [
        'approve'                => 'Approved',
        'approve_with_comments'  => 'Approved Subject to Compliance of Comments',
        'needs_clarification'    => 'Needs Clarificatory Information',
        'not_compliant'          => 'Not Compliant to DOST Guidelines',
    ],

    // SSRF guard: hostnames the server is permitted to reach for a local
    // Ollama instance. Any admin-supplied base URL must match one of these.
    // Override via OLLAMA_ALLOWED_HOSTS (comma-separated) for remote setups.
    'ollama_allowed_hosts' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('OLLAMA_ALLOWED_HOSTS', 'localhost,127.0.0.1,::1'))
    ))),
];
