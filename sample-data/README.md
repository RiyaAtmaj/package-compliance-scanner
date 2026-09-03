# Sample case matrix

These ten demo cases define expected scenarios. Add package photographs to the named folders when collecting assets; the app accepts user-supplied images.

1. `compliant/full-declarations` - all five declarations visible.
2. `violations/missing-mrp` - quantity, maker, date, and care present; MRP absent.
3. `violations/missing-quantity` - MRP and other core declarations present; quantity absent.
4. `violations/missing-manufacturer` - no maker/packer identity line.
5. `violations/missing-date` - no manufacturing, packing, or best-before date.
6. `violations/missing-consumer-care` - no phone, email, or care address.
7. `violations/multiple-missing` - MRP and care declarations absent.
8. `compliant/alternate-units` - quantity uses kg or litres and passes presence screening.
9. `compliant/packed-date` - uses a packing date rather than manufacturing date.
10. `violations/poor-quality-image` - blurred or glare-heavy image expected to produce low OCR confidence or an unreadable-image error.