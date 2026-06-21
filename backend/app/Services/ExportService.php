<?php

namespace App\Services;

use App\Models\TnaForm;
use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;

class ExportService
{
    /** Assemble a normalized view-model for a form. */
    public function assemble(TnaForm $form): array
    {
        $form->loadMissing(['sections', 'submitter:id,name']);
        $titles = config('tna.sections');
        $sections = $form->sections->keyBy('section_key');

        $data = [];
        foreach ($titles as $key => $title) {
            $data[] = [
                'title' => $title,
                'fields' => $this->flatten($sections->get($key)?->data ?? []),
            ];
        }

        return [
            'enterprise_name' => $form->enterprise_name ?: 'Untitled',
            'status' => $form->status,
            'province' => $form->province,
            'submitted_by' => $form->submitter?->name,
            'sections' => $data,
        ];
    }

    // Words that need specific capitalization instead of plain Title Case.
    private const ACRONYMS = [
        'Pwd' => 'PWD', 'Pwds' => 'PWDs', 'Gmp' => 'GMP',
        'Haccp' => 'HACCP', 'Php' => 'PHP', 'Id' => 'ID',
    ];

    /** Display-only label for a snake_case key (matches the web UI). */
    private function humanizeLabel(string $key): string
    {
        $words = explode(' ', ucwords(str_replace('_', ' ', $key)));
        $words = array_map(fn ($w) => self::ACRONYMS[$w] ?? $w, $words);

        return implode(' ', $words);
    }

    /** Turn a section data array into [label => printable string] pairs. */
    private function flatten(array $data): array
    {
        $out = [];
        foreach ($data as $key => $value) {
            $label = $this->humanizeLabel((string) $key);
            if (is_array($value)) {
                if ($value === []) {
                    continue;
                }
                // Array of row objects -> readable lines.
                $lines = [];
                foreach ($value as $row) {
                    $lines[] = is_array($row) ? implode(' | ', array_map('strval', $row)) : (string) $row;
                }
                $out[$label] = implode("\n", $lines);
            } elseif ($value !== '' && $value !== null) {
                $out[$label] = (string) $value;
            }
        }

        return $out;
    }

    public function pdf(TnaForm $form): \Barryvdh\DomPDF\PDF
    {
        return Pdf::loadView('exports.tna', ['model' => $this->assemble($form)])
            ->setPaper('a4');
    }

    /** Build a DOCX and return the path to a temp file. */
    public function docx(TnaForm $form): string
    {
        $model = $this->assemble($form);

        $word = new PhpWord();
        $section = $word->addSection();

        $word->addTitleStyle(1, ['bold' => true, 'size' => 16, 'color' => '004A98']);
        $word->addTitleStyle(2, ['bold' => true, 'size' => 13, 'color' => '004A98']);

        $section->addText('DOST Technology Needs Assessment — Form 01', ['bold' => true, 'size' => 18, 'color' => '004A98']);
        $section->addText($model['enterprise_name'], ['bold' => true, 'size' => 14]);
        $section->addText('Province: ' . ($model['province'] ?? '—') . '  ·  Status: ' . $model['status']);
        $section->addTextBreak(1);

        foreach ($model['sections'] as $sec) {
            $section->addTitle($sec['title'], 2);
            if (empty($sec['fields'])) {
                $section->addText('No data entered.', ['italic' => true, 'color' => '888888']);
                $section->addTextBreak(1);
                continue;
            }
            $table = $section->addTable([
                'borderSize' => 6,
                'borderColor' => 'CCCCCC',
                'cellMargin' => 60,
                'width' => 100 * 50,
                'unit' => 'pct',
            ]);
            foreach ($sec['fields'] as $label => $value) {
                $table->addRow();
                $table->addCell(3000, ['bgColor' => 'F4F5F7'])->addText($label, ['bold' => true]);
                $cell = $table->addCell(6000);
                foreach (explode("\n", $value) as $line) {
                    $cell->addText($line);
                }
            }
            $section->addTextBreak(1);
        }

        $path = tempnam(sys_get_temp_dir(), 'tna_') . '.docx';
        IOFactory::createWriter($word, 'Word2007')->save($path);

        return $path;
    }
}
