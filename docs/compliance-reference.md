# Prototype compliance reference

The current narrow rule subset is configurable in `rules/complianceRules.json`:

| ID | Declaration screened | Prototype behavior |
| --- | --- | --- |
| LM001 | MRP | Requires an extracted MRP value |
| LM002 | Net quantity | Requires an extracted quantity/unit value |
| LM003 | Manufacturer/packer | Requires an extracted identity line |
| LM004 | Date information | Requires an extracted manufacturing/packing/best-before line |
| LM005 | Consumer care | Requires a phone, email, or care address |

A PASS means only that relevant text was detected, not that its content, placement, format, or accuracy is legally compliant.