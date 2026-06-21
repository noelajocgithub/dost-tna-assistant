<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        * { font-family: DejaVu Sans, sans-serif; }
        body { color: #1E1E1E; font-size: 11px; }
        h1 { color: #004A98; font-size: 18px; margin: 0 0 2px; }
        h2 { color: #004A98; font-size: 13px; border-bottom: 2px solid #00B5E2; padding-bottom: 2px; margin: 16px 0 6px; }
        .meta { color: #555; font-size: 10px; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; }
        td { border: 1px solid #CCCCCC; padding: 4px 6px; vertical-align: top; }
        td.label { background: #F4F5F7; font-weight: bold; width: 30%; }
        .empty { color: #888; font-style: italic; }
        .pre { white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>DOST Technology Needs Assessment — Form 01</h1>
    <div class="meta">
        <strong>{{ $model['enterprise_name'] }}</strong><br>
        Province: {{ $model['province'] ?? '—' }} ·
        Submitted by: {{ $model['submitted_by'] ?? '—' }} ·
        Status: {{ $model['status'] }}
    </div>

    @foreach ($model['sections'] as $section)
        <h2>{{ $section['title'] }}</h2>
        @if (empty($section['fields']))
            <p class="empty">No data entered.</p>
        @else
            <table>
                @foreach ($section['fields'] as $label => $value)
                    <tr>
                        <td class="label">{{ $label }}</td>
                        <td class="pre">{{ $value }}</td>
                    </tr>
                @endforeach
            </table>
        @endif
    @endforeach

    @if (!empty($model['images']))
        <h2>Attachments</h2>
        @foreach ($model['images'] as $img)
            <p style="font-weight:bold; margin:8px 0 2px;">{{ $img['label'] }}</p>
            <img src="{{ $img['data_uri'] }}" style="max-width:100%; max-height:360px; border:1px solid #CCCCCC;">
        @endforeach
    @endif
</body>
</html>
