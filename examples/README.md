# Import Templates

This folder contains example templates for importing cards into FigJam Planning Card Creator.

## Available Templates

### YAML Format ([cards.yaml](cards.yaml))

The recommended format for its readability. Each card is separated by `---`.

```yaml
title: Your Card Title
objective: What this card aims to achieve
dependencies:
  - First dependency
  - Second dependency
requirements:
  - First requirement
  - Second requirement
lift: 3
start_date: 2024-01-15
end_date: 2024-01-18
```

### JSON Format ([cards.json](cards.json))

Best for programmatic generation from other tools.

```json
[
  {
    "title": "Your Card Title",
    "content": "Your Card Title\n\nObjective: What this card aims to achieve\n\nDependency:\nFirst dependency\nSecond dependency\n\nRequirements:\nFirst requirement\nSecond requirement\n\nLift (Days) = 3\n\nStart Date = 2024-01-15\nEnd Date = 2024-01-18"
  }
]
```

## How to Use

1. Copy the contents of either template file
2. Open the FigJam Planning Card Creator plugin
3. Go to the **Import Cards** tab
4. Paste your cards
5. Click **Add Cards**

## Field Reference

**Required Fields:**

- `title` - The card title
- `objective` - What this card aims to achieve

**Optional Fields:**

- `dependencies` - List of dependencies
- `requirements` - List of requirements  
- `lift` - Estimated days of effort
- `start_date` - When work begins
- `end_date` - When work completes

## Tips

- You can import multiple cards at once
- YAML format is easier to write by hand
- JSON format is better for generating from scripts
- All optional fields can be omitted
- Lists can be single items or arrays
